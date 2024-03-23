import csvjson from "csvjson";
import Contact from "../model/contacts.js";
export const generateToCsv = async () => {
  const contacts = await Contact.find();
  const deleteObjectV = contacts?.map((item) => {
    // hapus object item.__v
    delete item.__v;
    return item;
  }); // menhapus bject __v dari bawaan mongdb
  const data = JSON.stringify(deleteObjectV); // ubah ke json data yang diperoleh dari mongodb
  const csvData = csvjson.toCSV(data, {
    // ubah json ke csv (file excell)
    headers: "key", // mensetting key yang ada di object menjadi header pada file csv
  });
  console.log("🚀 ~ generateToCsv ~ csvData:", csvData);

  return csvData;
};
