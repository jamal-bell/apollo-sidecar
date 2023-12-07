// client-side.js

const exportedMethods = {
    renderProfileMenu() {
      var menuHTML = `
        <a class="navmenu-brand" href="#">User Profile</a>
        <ul class="nav navmenu-nav flex-column">
          <li class="nav-item"><a class="nav-link" href="/user/edit">Edit Profile</a></li>
          <li class="nav-item active"><a class="nav-link" href="/user/password">Change password</a></li>
          <li class="nav-item"><a class="nav-link" href="/user/cancel">Cancel account</a></li>
          <li class="nav-item"><a class="nav-link" href="/logout">Logout</a></li>
        </ul>
      `;
      return menuHTML;
    },

  };
  
  export default exportedMethods;
  