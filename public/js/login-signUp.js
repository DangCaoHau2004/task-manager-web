document
  .querySelector(".change-sign-up")
  .addEventListener("click", function () {
    var signInElement = document.querySelector(".form-container.sign-in");
    var signUpElement = document.querySelector(".form-container.sign-up");
    var introduceSignIn = document.querySelector(".introduce.sign-in");
    var introduceSignUp = document.querySelector(".introduce.sign-up");

    // Xóa animation cũ (nếu có)
    signInElement.classList.remove("animation-turnright");
    signUpElement.classList.remove("animation-turnleft");
    introduceSignIn.classList.remove("animation-turnleft");
    introduceSignUp.classList.remove("animation-turnright");
    //sửa lại hình dạng của
    // Thêm animation
    signInElement.classList.add("animation-turnright");
    introduceSignIn.classList.add("animation-turnleft");
    //thêm lớp thay đổi hình dạng của sign-in
    introduceSignIn.style.borderTopRightRadius = "30%";
    introduceSignIn.style.borderTopLeftRadius = "10px";
    introduceSignIn.style.borderBottomRightRadius = "30%";
    introduceSignIn.style.borderBottomLeftRadius = "10px";

    // Đợi animation kết thúc rồi mới ẩn và hiện các phần tử
    introduceSignIn.addEventListener("animationend", function () {
      //form-container sign-in
      signInElement.style.display = "none";
      //form-container sign-up
      signUpElement.style.display = "block";
      //introduce sign-in
      introduceSignIn.style.display = "none";
      //introduce sign-up
      introduceSignUp.style.display = "block";

      // sửa lại viền của introduce sign-in
      introduceSignIn.style.borderTopRightRadius = "10px";
      introduceSignIn.style.borderTopLeftRadius = "30%";
      introduceSignIn.style.borderBottomRightRadius = "10px";
      introduceSignIn.style.borderBottomLeftRadius = "30%";
    });
  });

document
  .querySelector(".change-sign-in")
  .addEventListener("click", function () {
    var signInElement = document.querySelector(".form-container.sign-in");
    var signUpElement = document.querySelector(".form-container.sign-up");
    var introduceSignIn = document.querySelector(".introduce.sign-in");
    var introduceSignUp = document.querySelector(".introduce.sign-up");

    // Xóa animation cũ (nếu có)
    signInElement.classList.remove("animation-turnright");
    signUpElement.classList.remove("animation-turnleft");
    introduceSignIn.classList.remove("animation-turnleft");
    introduceSignUp.classList.remove("animation-turnright");

    // Thêm animation
    signUpElement.classList.add("animation-turnleft");
    introduceSignUp.classList.add("animation-turnright");
    //sửa lại viền của introduce sign-up
    introduceSignUp.style.borderTopRightRadius = "10px";
    introduceSignUp.style.borderTopLeftRadius = "30%";
    introduceSignUp.style.borderBottomRightRadius = "10px";
    introduceSignUp.style.borderBottomLeftRadius = "30%";
    // Đợi animation kết thúc rồi mới ẩn và hiện các phần tử
    introduceSignUp.addEventListener("animationend", function () {
      //form-container sign-in
      signInElement.style.display = "block";
      //form-container sign-up
      signUpElement.style.display = "none";
      //introduce sign-in
      introduceSignIn.style.display = "block";
      //introduce sign-up
      introduceSignUp.style.display = "none";
      introduceSignUp.style.borderTopRightRadius = "30%";
      introduceSignUp.style.borderTopLeftRadius = "10px";
      introduceSignUp.style.borderBottomRightRadius = "30%";
      introduceSignUp.style.borderBottomLeftRadius = "10px";
    });
  });
