import db from "../config/database.js";
function saveMessagesToDB(message, sender_id, receiver_id) {
  try {
    db.query(
      "INSERT INTO chat_messages(sender_id, receiver_id, message) VALUES($1, $2, $3)",
      [sender_id, receiver_id, message]
    );
  } catch (error) {
    console.log("Có lỗi xảy ra trong messages.js: " + error);
  }
}

export { saveMessagesToDB };
