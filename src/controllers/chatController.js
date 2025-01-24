import db from "../config/database.js";

async function chatControllerGet(req, res) {
  if (!req.session.user) {
    return res.redirect("/login-signUp");
  }

  // Lấy các tin nhắn của người dùng
  let resultChatMessages = await db.query(
    `SELECT *
      FROM chat_messages 
      WHERE sender_id = $1 OR receiver_id = $1
      ORDER BY id;`,
    [req.session.user.id_user]
  );

  if (resultChatMessages.rows.length == 0) {
    return res.render("./chat/chat.ejs", { user: req.session.user });
  }

  let list_messages = resultChatMessages.rows;
  let messages = {};

  // Lặp qua các tin nhắn và lưu trữ tin nhắn cuối cùng của mỗi cặp sender và receiver
  list_messages.forEach((message) => {
    // Tạo roomId là chuỗi kết hợp sender_id và receiver_id theo thứ tự nhỏ hơn lớn hơn
    let senderId = parseInt(message.sender_id);
    let receiverId = parseInt(message.receiver_id);

    let roomId =
      senderId < receiverId
        ? senderId + "" + receiverId
        : receiverId + "" + senderId;

    // Lưu trữ tin nhắn cuối cùng cho mỗi đoạn chat
    messages[roomId] = {
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      message: message.message,
      is_read: message.is_read,
    };
  });
  for (let roomId in messages) {
    let id_ortherUser =
      messages[roomId].sender_id == req.session.user.id_user
        ? messages[roomId].receiver_id
        : messages[roomId].sender_id;
    let result = await db.query("SELECT name FROM users WHERE id_user = $1", [
      id_ortherUser,
    ]);
    messages[roomId].username = result.rows[0].name;
  }

  res.render("./chat/chat.ejs", { user: req.session.user, messages: messages });
}

async function chatMessagesControllerget(req, res) {
  if (req.session.user) {
    if (!req.query.id_user) {
      return res.redirect("/?errorAddTask=1");
    }
    const idOrtherUser = req.query.id_user;
    // xử lý trường hợp id user và idOrtherUser la một

    if (req.session.user.id_user == idOrtherUser) {
      return res.redirect("/?errorAddTask=1");
    }
    try {
      // lấy thông tin của user khác

      let resutOrtherUser = await db.query(
        "SELECT * FROM users WHERE id_user = $1",
        [idOrtherUser]
      );

      let ortherUser = resutOrtherUser.rows[0];
      // kiểm tra nếu ko tồn tại user
      if (!ortherUser) {
        return res.redirect("/?errorAddTask=1");
      }

      // lấy thông tin đoạn chat có tồn tại id_user và req user
      let resultChatMessages = await db.query(
        "SELECT * FROM chat_messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY id",
        [req.session.user.id_user, idOrtherUser]
      );
      let list_messages = resultChatMessages.rows;

      // cập nhật trạng thái tin nhắn thành đã đọc, ko cần await
      db.query(
        "UPDATE chat_messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2",
        [idOrtherUser, req.session.user.id_user]
      );

      // tham gia vào room với id sẽ theo công thức là id_user nhỏ hơn sẽ nằm trước vd id_user 1 và 2 sẽ có roomid là 12
      const roomId =
        req.session.user.id_user > idOrtherUser
          ? idOrtherUser + "" + req.session.user.id_user
          : req.session.user.id_user + "" + idOrtherUser;

      return res.render("./chat/chat_messages.ejs", {
        user: req.session.user,
        ortherUser: ortherUser,
        list_messages: list_messages,
        roomId: roomId,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/?errorAddTask=1");
    }
  } else {
    return res.redirect("/login-signUp");
  }
}

export { chatControllerGet, chatMessagesControllerget };
