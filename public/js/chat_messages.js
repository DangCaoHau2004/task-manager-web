const socket = io();
const id_user = document.getElementsByName("id_user")[0].value;
const id_ortherUser = document.getElementsByName("id_ortherUser")[0].value;
const username = document.getElementsByName("username")[0].value;
const ortherUsername = document.getElementsByName("ortherUsername")[0].value;
const roomId = document.getElementsByName("roomId")[0].value;

let content = document.querySelector(".content");
socket.emit("join", roomId);
// Kéo trang đến cuối
window.onload = function () {
  window.scrollTo(0, document.body.scrollHeight);
};
// nhận tin nhắn
socket.on("receiver_message", (data) => {
  //xóa dòng bạn chưa nhắn gì cả
  if (document.querySelector(".not-chat")) {
    document.querySelector(".not-chat").innerHTML = "";
  }

  if (data.sender_id == id_user) {
    content.innerHTML += `
     <div class="d-flex flex-row-reverse">
    <h5 class="m-0 ms-3">${username}</h5>
    <p
      class="text-white p-2 rounded user_message"
      style="background-color: rgb(156, 27, 195)"
    >
      ${data.message}
    </p>
  </div>
  `;
  } else {
    content.innerHTML += `<div class="d-flex">
    <h5 class="m-0 me-3">${ortherUsername}</h5>
    <p
      class="text-white p-2 rounded ortherUser_message"
      style="background-color: rgb(156, 27, 195)"
    >
      ${data.message}
    </p>
  </div>`;
  }
});
document
  .getElementsByClassName("send_message")[0]
  .addEventListener("click", () => {
    let message = document.getElementsByName("message")[0].value;
    socket.emit("send_message", {
      sender_id: id_user,
      receiver_id: id_ortherUser,
      message: message,
      roomId: roomId,
    });
    document.getElementsByName("message")[0].value = "";
  });
