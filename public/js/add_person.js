document.getElementById("add_person").addEventListener("click", () => {
  let form = document.getElementById("add_person_form");

  // Tạo một input mới với datalist mới
  let insertValue = `
        <label for="names" class="mb-2">Chọn người cần thêm:</label>
            <input
              list="nameList"
              name="name"
              placeholder="Id người dùng ... "
              class="form-control"
            />
            <datalist id="nameList">
              <% friends.forEach((friend)=>{%>
              <option value="<%= friend.id_user %>"><%= friend.name %></option>
              <% }) %>
            </datalist>
          </div>
          <label for="disabledSelect" class="form-label"
            >Quyền hạn:</label
          >
          <select id="disabledSelect" class="form-select mb-2" name = "role">
            
          <option value="2">Project Manager</option>
            <option value="3">Member</option>
          </select>
    `;

  // Thêm input mới vào form
  form.innerHTML += insertValue;
});
