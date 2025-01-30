const resultsBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");
const searchButton = document.getElementById("search-button");

let abortController = new AbortController();

inputBox.onkeyup = function(){
  search(3);   
}

searchButton.addEventListener("click", function() {
  search(3);
});

function search(results) {
  let input = inputBox.value;
  if (input.length) {

    abortController.abort();
    abortController = new AbortController();

    fetchJsonPath(`https://openlibrary.org/search.json?q=${encodeURIComponent(input)}&limit=${results}`, 'docs')
    .then((docs) => {
      const titles = docs.slice(0, results).map(doc => doc.title);
      const covers = docs.slice(0, results).map(doc => doc.cover_edition_key);
      const authors = docs.slice(0, results).map(doc => doc.author_name ? doc.author_name.join(', ') : 'Unknown Author'); 
      const years = docs.slice(0, results).map(doc => doc.first_publish_year || 'Unknown Year');
      const editions = docs.slice(0, results).map(doc => doc.edition_count);
      const key = docs.slice(0, results).map(doc => doc.lending_edition_s || doc.key.replace('/works/', ''));
      
      display(titles, covers, authors, years, key, editions);
    })
    .catch((error) => console.error('Error:', error));
  }
}

async function display(titles, covers, authors, years, key, editions) {
  if(titles.length === 0) {
    resultsBox.innerHTML = '<ul><li class="no-hover">-No results found-</li></ul>';
    return;
  }  
  const content = await Promise.all(titles.map(async (title, index) => {
        return `<li onClick="selectInput('${key[index]}')"> 
                    <img src="https://covers.openlibrary.org/b/olid/${covers[index]}-M.jpg"/> 
                    <div>
                        <tagname class="book-title">${title}<tagname class="book-proptie-p"></tagname></tagname>
                        
                        <tagname class=".book-properties">
                            <tagname class="book-proptie-p">by</tagname> ${authors[index]}
                            <tagname class="book-proptie-p"> ‧ Available Editions: </tagname> ${editions[index]} 
                            <tagname class="book-proptie-p"> ‧ Published: </tagname> ${years[index]}
                        </tagname>
                        <tagname class="book-descrption"> </tagname> 
                    </div>
                </li>`;
    }));

    var addition = '';
    if (titles.length >= 3) {
        addition = ` <li class="no-hover show-more"> <a herf="#" onClick="showMore(${titles.length+3})">See more results</a> </li> `;
    }
    resultsBox.innerHTML = "<ul>" + content.join('') + addition + "</ul>";
}

function selectInput(key){
  window.open(`https://openlibrary.org/works/${key}`, '_blank');
}

function showMore(results) {
  const button = document.querySelector('.show-more');
  button.innerHTML = "Please wait...";
  search(results);
}

async function fetchJsonPath(url, path) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const result = path.split('.').reduce((acc, key) => acc && acc[key], data);
      return result;
  } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
  }
}
  

