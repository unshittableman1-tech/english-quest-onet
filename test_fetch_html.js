async function testFetchHtml() {
  const url = "https://docs.google.com/spreadsheets/d/1X6ZJBIRP8_dk98URmIBkeDxFT8AXEcM1VhXtq2FFPkU/edit?usp=sharing";
  
  try {
    const res = await fetch(url);
    const data = await res.text();
    
    // Look for sheet IDs
    // In the HTML of Google Sheets, there's usually a JS array containing sheet metadata.
    // e.g. `[123456789,"Sheet1",...]`
    const fs = await import('fs');
    fs.writeFileSync('sheet_html.txt', data);
    
    // Try to regex find names and GIDs
    // Typically it's something like: {name: "ป6-1", gid: "0"} (but in an array)
    // Actually, searching for the string "ป6-2" in the html
    
    const index = data.indexOf('ป6-2');
    if (index !== -1) {
       console.log("Found ป6-2 at index", index);
       console.log("Context:", data.substring(index - 200, index + 200));
    } else {
       console.log("Could not find ป6-2");
    }
  } catch (e) {
    console.error(e);
  }
}

testFetchHtml();
