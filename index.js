const PORT = 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const myApp = express();
const path = require('path');


const ARTICLES_PER_PAGE = 42;
myApp.use(express.static(path.join(__dirname, 'images')));


function serverRunningCallback() {
    console.log(`Server is running on PORT ${PORT}`);
}

const newsSources = [
    "https://techcrunch.com/",
    "https://www.artificialintelligence-news.com/",
    "https://www.theguardian.com/technology/artificialintelligenceai",
    "https://apnews.com/hub/artificial-intelligence",
    "https://www.nbcnews.com/artificial-intelligence",
    "https://www.sciencenews.org/topic/artificial-intelligence",
];

myApp.get("/", (req, res) => {
    res.send(`
    <html>
  <head>
    <title>AI News API</title>
    <style>
      body {
        background-color: #455d7a;
        color: white;
        font-family: 'Arial', sans-serif;
        text-align: center; 
      }

      h1 {
        font-style: italic;
      }

      form {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
      }

      button {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        border-radius: 5px;
      }

      button:hover {
        background-color: #45a049;
      }

      .image-container {
        text-align: center; 
      }
      



      footer {
        background-color: #333;
        color: white;
        text-align: center;
        position: fixed;
        bottom: 0;
        width: 100%;
      }
      .content-wrapper {
        flex: 1;
      }
    </style>
  </head>
  <body>
  <div class="content-wrapper">

    <h1>Welcome to my AI news API</h1>
    <p>Sources used:</p>
    <img src="https://techcrunch.com/wp-content/uploads/2018/04/tc-logo-2018-square-reverse2x.png" width="50" height="50">
    <img src="https://www.artificialintelligence-news.com/wp-content/uploads/sites/9/2020/03/ai-newsv4-2-svg.png" width="130" height="50">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/The_Guardian_2018.svg/1920px-The_Guardian_2018.svg.png" width="80" height="50">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Associated_Press_logo_2012.svg/800px-Associated_Press_logo_2012.svg.png" width="50" height="50">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/NBC_logo_2022_%28vertical%29.svg/1024px-NBC_logo_2022_%28vertical%29.svg.png" width="50" height="50">      
    <p>Use the form below to fetch AI-related news articles:</p>
    <form action="/news" method="get">
      <button type="submit">Fetch News</button>
    </form>
    </div>
    <footer>
    <p>Ivan Znaor 2023</p>
  </footer>
  </body>
</html>
    `);
});

myApp.get("/news", async (req, res) => {
    const news_articles = [];

    try {
        for (const source of newsSources) {
            const response = await axios.get(source);
            const html = response.data;
            const $ = cheerio.load(html);

            $('a:contains("AI")', html).each(function () {
                const title = $(this).text();
                const url = $(this).attr("href");
                news_articles.push({ title, url });
            });
        }

        const page = req.query.page || 1;
        const startIndex = (page - 1) * ARTICLES_PER_PAGE;
        const endIndex = startIndex + ARTICLES_PER_PAGE;
        const paginatedArticles = news_articles.slice(startIndex, endIndex);

        res.send(`
          <html>
            <head>
            <style>
            button {
                position: absolute;
                top: 10px; 
                right: 10px;
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                border-radius: 5px;
              }
        
              button:hover {
                background-color: #45a049;
              }

        
              footer {
                background-color: #333;
                color: white;
                text-align: center;
                position: fixed;
                bottom: 0;
                width: 100%;
              }

              .content-wrapper {
                flex: 1;
              }
            </style>
              <title>AI News</title>
            </head>
            <body style="background-color: #455d7a; color: white;">
              <h1>AI News Article fetcher</h1>
              <ul>
                ${paginatedArticles.map(article => `<li><a href="${article.url}" target="_blank" style="color: #E3DEDC;">${article.title}</a></li>`).join('')}
              </ul>
              ${renderPaginationLinks(news_articles.length, page)}
              <form action="/" method="get">
      <button type="submit">Home</button>
    </form>
    <footer>
    <p>Ivan Znaor 2023</p>
  </footer>
            </body>
          </html>
        `);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

function renderPaginationLinks(totalArticles, currentPage) {
    const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
    let paginationHTML = '<div style="margin-top: 20px;">Pages: ';

    for (let i = 1; i <= totalPages; i++) {
        if (i == currentPage) {
            paginationHTML += `<strong>${i}</strong> `;
        } else {
            paginationHTML += `<a href="/news?page=${i}" style="color: #E3DEDC;">${i}</a> `;
        }
    }

    paginationHTML += '</div>';
    return paginationHTML;
}
myApp.listen(PORT, serverRunningCallback);
