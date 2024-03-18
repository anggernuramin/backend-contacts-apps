import mongoose from "mongoose";

// Membuat model data contact yang akan di masukkan ke db dengan membuat collection dengan nama contact pada database contacst-app
const Contact = mongoose.model("contact", {
  // isi dokumen dari colection contact
  name: {
    // validasi
    type: String,
    required: true,
  },
  nohp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

export default Contact;

// Menggunakan model untuk menambahka data
// const contact1 = new Contact({
//   name: "Aprilia",
//   nohp: "08786798687",
//   email: "vindi@yahoo.com",
// });

// simpan contact/masukkankan contact 1 ke collection contact pada database
// contact1.save().then(() => console.log(contact1));
