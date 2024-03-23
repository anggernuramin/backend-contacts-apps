import mongoose from "mongoose";

const FileDownload = mongoose.model("fileDownload", {
  // isi dokumen dari colection contact
  type: {
    // validasi
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export default FileDownload;

// Menggunakan model untuk menambahka data
// const contact1 = new Contact({
//   name: "Aprilia",
//   nohp: "08786798687",
//   email: "vindi@yahoo.com",
// });

// simpan contact/masukkankan contact 1 ke collection contact pada database
// contact1.save().then(() => console.log(contact1));
