let dataBlog = []; //parkiran
var inputImage = "";

function prev_image(event) {
  var reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);
  reader.onload = function () {
    inputImage = reader.result;
  };
  document.getElementById("attach-image").innerHTML =
    event.target.files[0].name;
}

function addBlog(event) {
  event.preventDefault();

  let title = document.getElementById("input-blog-title").value;
  let content = document.getElementById("input-blog-content").value;

  //mobil
  let blog = {
    title,
    content: content,
    inputImage,
  };

  dataBlog.push(blog); // dataBlog = [blog,blog]

  console.log(dataBlog);

  renderBlog();
}

function renderBlog() {
  document.getElementById("contents").innerHTML = "";

  for (let i = 0; i < dataBlog.length; i++) {
    document.getElementById("contents").innerHTML += `
    <div class="blog-list-item">
          <div class="blog-image">
            <img src=${dataBlog[i].inputImage} alt="" />
          </div>
          <div class="blog-content">
            <div class="btn-group">
              <button class="btn-edit">Edit Post</button>
              <button class="btn-post">Delete Post</button>
            </div>
            <h1>
              <a href="blog-detail.html" target="_blank"
                >${dataBlog[i].title}</a
              >
            </h1>
            <div class="detail-blog-content">
              12 Jul 2021 22:30 WIB | Ichsan Emrald Alamsyah
            </div>
            <p>
            ${dataBlog[i].content}
            </p>
          </div>
        </div>`;
  }
}