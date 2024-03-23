import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Contact from "../model/contacts.js";

const doc = new jsPDF();

export const generateToPdf = async () => {
  const contacts = await Contact.find();
  // Menambahkan judul
  doc.setFontSize(18);
  doc.text("List Contacts", 15, 10); // Judul tabel, argumen pertama untuk name judul, argumen ke 2 untuk menggeser ke kiri kanan(jika nilai tambah besar maka akan kenana), argumen ke 3 atas bawah

  const headers = [["No", "Name", "	No HandPhone", "Email"]]; // Menambahkan header tabel untuk judul
  const rows = contacts.map((item, index) => [
    index + 1,
    item.name,
    item.email,
    item.nohp,
  ]); // membuat data menjadi array 2 dimensi, karena setiap baris data pada autotable harus berupa array

  // Menggunakan autotable untuk membuat tabel
  doc.autoTable({
    theme: "grid",
    // startY: 20, // Mulai dari posisi y = 20
    head: headers,
    body: rows,
  });
  let data = "";
  // Menyimpan dokumen PDF ke dalam file
  const pdfFilePath = "./data/contacts.pdf"; // Path untuk menyimpan file PDF
  const buffer = doc.save(data); // menyimpan hasil generate json to pdf ke file contacts.pdf

  return pdfBlob;
};
