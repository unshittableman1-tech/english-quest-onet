async function testFetch() {
  const url = "https://docs.google.com/spreadsheets/d/1X6ZJBIRP8_dk98URmIBkeDxFT8AXEcM1VhXtq2FFPkU/export?format=csv";
  console.log("Fetching: " + url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log("Failed: " + response.status);
    } else {
      const text = await response.text();
      console.log("Success! Data:");
      console.log(text.substring(0, 200));
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
testFetch();
