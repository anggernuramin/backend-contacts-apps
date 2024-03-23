import {} from "dotenv/config.js";
import express from "express";
import cors from "cors";
import fs, { stat, writeFileSync } from "fs";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import { body, check, validationResult } from "express-validator";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors()); // to allow cross origin requests
app.use(bodyParser.json()); // to convert the request into JSON

import { connectDb } from "./utils/db.js"; // connect database
connectDb();
import Contact from "./model/contacts.js"; // schema database
import { generateToPdf } from "./libs/downloadPdf.js";
import { generateToCsv } from "./libs/downloadCsv.js";

// start middleware
app.use(express.static("public"));

// create flash message
app.use(flash());
app.use(cookieParser());
app.use(
  session({
    cookie: { maxAge: 60000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
// end falsh message
app.use(express.urlencoded({ extended: true })); // mengambil value dari form
// app.use(methodOverride("_method")); // package digunakan untuk menoverride http
// end middleware

// halaman home
app.get("/", (req, res) => {
  try {
    const defaultContacts = [
      {
        name: "Angger Nur Amin",
        email: "anggern514@gmail.com",
        nohp: "088989410007",
      },
      {
        name: "John doe",
        email: "johndoe.com",
        nohp: "08827389279832",
      },
      {
        name: "Angger Nur Amin",
        email: "anggern514@gmail.com",
        nohp: "088989410007",
      },
      {
        name: "John doe",
        email: "johndoe.com",
        nohp: "08827389279832",
      },
      {
        name: "Angger Nur Amin",
        email: "anggern514@gmail.com",
        nohp: "088989410007",
      },
      {
        name: "John doe",
        email: "johndoe.com",
        nohp: "08827389279832",
      },
      {
        name: "Angger Nur Amin",
        email: "anggern514@gmail.com",
        nohp: "088989410007",
      },
      {
        name: "John doe",
        email: "johndoe.com",
        nohp: "08827389279832",
      },
    ];

    res.setHeader("Content-Type", "application/json"); // Menambahkan header Content-Type
    res.setHeader("Access-Control-Allow-Origin", "*"); // Menambahkan header CORS

    res.status(200).json({
      status: "success",
      data: defaultContacts,
      message: "Data kontak berhasil dimuat",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal memuat data kontak",
      error: {
        code: 500,
        description: error.message,
      },
    });
  }
});

// halaman contact
app.get("/contact", async (req, res) => {
  // Contact adalah nama collection
  res.setHeader("Content-type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const contacts = await Contact.find();
    if (!contacts) {
      throw new Error("No Contacts List Found");
    }
    res.status(200).json({
      status: "success",
      data: contacts,
      message: "Data kontak berhasil dimuat",
      notification: req.flash("notification"),
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: "Tidak ditemukan data kontak",
      error: {
        code: 500,
        description: error.message,
      },
    });
  }
});

// post handle download file
app.post("/contact/download", async (req, res) => {
  // res.download("data/contacts.json");
  const typeFile = req.body.downloadFile;
  const dirPath = "./data";
  const dataPath = `./data/contacts.${typeFile}`;
  // buat direktory data jika belum ada

  fs.stat(dirPath, (err) => {
    if (err) {
      fs.mkdirSync(dirPath);
    }
  });

  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, "[]");
  }

  if (typeFile === "Json") {
    const contacts = await Contact.find();
    await fs.promises.writeFile(dataPath, JSON.stringify(contacts));
    res.download(dataPath);
  }
  if (typeFile === "Pdf") {
    generateToPdf();
    res.download(dataPath);
  }

  if (typeFile === "csv") {
    generateToCsv();
    res.download(dataPath);
  }
});

app.post(
  "/contact",
  [
    body("name").custom(async (value) => {
      const duplikat = await Contact.findOne({ name: value });
      if (duplikat) {
        throw new Error("Nama sudah ada");
      }
      return true;
    }),
    check("nohp")
      .isMobilePhone("id-ID")
      .withMessage("Nomor hp yang anda masukkan tidak valid."),
    check("email")
      .isEmail()
      .withMessage("Email yang anda masukkan tidak valid."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: errors.array(),
      });
    } else {
      try {
        // tambah 0 ke no hp jika no hp adalah indonesia
        await Contact.insertMany(req.body);
        req.flash("notification", "Data berhasil ditambkan");
        return res.status(200).json({
          status: "success",
          message: "Data Berhasil ditambahkan",
        });
      } catch (error) {
        return res.status(500).json({
          status: "error",
          message: error.message,
        });
      }
    }
  }
);

// halaman hasil search contact
app.get("/contact/search", async (req, res) => {
  try {
    const query = req.query.q; // Mendapatkan nilai parameter pencarian dari URL yaitu q (sesaui dengan keyword setelah tanda "contact/search/?")
    const searchContact = await Contact.find({
      name: { $regex: query, $options: "i" },
    }); // mengambil menggunakan regex ke data dengan ketentuan apapun nama yang mengandung kata pada query dan option i artinya kata akan case senstitif ada huruf kecil atau besar yang sama pada query maka data akan ditampilkan
    if (searchContact?.length > 0) {
      res.status(200).json({
        status: "success",
        contacts: searchContact,
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Data Kontak Tidak ditemui",
        contacts: [],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// post from search contact yang akan menamgambil dari dat dari query
app.post("/search/contact", (req, res) => {
  try {
    // Ambil value yang dikirim di form search
    const query = req.body.search;
    // gunakan encodedURIComponent agar query diubah ke format url yang valid misal tanda spasi akan diganti %20 ke format url
    const searchUrl = `/contact/search?q=${encodeURIComponent(query)}`;
    // redirect ke halaman /seacrh/contact?q=========
    // res.redirect(searchUrl);

    return res.status(200).json({
      status: "succes",
      message: "Query  received!",
      searchUrl: `/contact/search?q=${query}`,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// method delete contact
app.delete("/contact", async (req, res) => {
  console.log(req.query.id);
  try {
    await Contact.deleteOne({ _id: req.query.id });
    res.status(200).json({
      status: "succes",
      message: "Data berhasil di hapus.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

//  method update
app.put(
  "/contact",
  [
    // isi dari check("") mengacu pada req body yang dikirim di frontend
    check("nohp")
      .isMobilePhone("id-ID")
      .withMessage("No hp yang anda masukkan tidak valid."),
    check("email")
      .isEmail()
      .withMessage("Email yang anda masukkan tidak valid"),
    body("name").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ name: value });

      //  jika nama diubah dan nama yang baru sudah ada di db maka akan return/throw pesan error
      if (req.body.oldname != value && duplikat?.name === value) {
        throw new Error("Nama sudah ada dalam contact. Gunakan nama yang lain");
      }
      return true;
    }),
  ],
  async (req, res) => {
    console.log("data", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: errors.array(),
      });
    } else {
      // Jika data tidak berubah
      const { _id } = req.body;
      const contact = await Contact.findOne({ _id: _id });
      if (
        contact?.name === req.body.name &&
        contact?.email === req.body.email &&
        contact?.nohp === req.body.nohp
      ) {
        res.status(200).json({
          status: "success",
          message: "Data Berhasil Di update",
        });
      } else {
        await Contact.updateOne(
          {
            _id: _id,
          },
          {
            $set: {
              name: req.body.name,
              email: req.body.email,
              nohp: req.body.nohp,
            },
          }
        );

        req.flash("notification", "Data berhasil diupdate");
        res.status(200).json({
          status: "success",
          message: "Data Berhasil Di update",
        });
      }
    }
  }
);

// halaman detail contact
app.get("/contact/:id", async (req, res) => {
  console.log("🚀 ~ app.get ~ req:", req);

  try {
    // ngequery ke mongo untuk mengambil contact berdarkan id
    const contact = await Contact.findOne({ _id: req.params.id });
    if (contact.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Gagal memuat data kontak",
      });
    }
    res.status(200).json({
      status: "success",
      data: contact,
      message: "Data kontak berhasil dimuat",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Gagal memuat data kontak",
      error: {
        code: 500,
        description: error.message,
      },
    });
  }
});

// home not found
app.use((req, res) => {
  res.status(404).json({
    message: "Halaman tidak ditemukan",
    status: 404,
  });
});

app.listen(port, () => {
  console.log(`listening in port ${port}`);
});
