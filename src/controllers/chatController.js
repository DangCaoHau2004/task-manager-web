import db from "../config/database.js";

function chatControllerGet(req, res) {
  res.render("./chat/chat.ejs");
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
