async function test() {
  try {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhyird8EfAwfyJx4tyy7stnR10wzr8k3kyhZ1tSH9JZGmcKkD2e_Q0JmAGJrl1y15PCyghiRS1zRlT/pub?output=csv';
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n');
    console.log('Line 0:', lines[0]);
    console.log('Line 1:', lines[1]);
    console.log('Line 2:', lines[2]);
    console.log('Line 3:', lines[3]);
    console.log('Line 4:', lines[4]);
    console.log('Line 5:', lines[5]);
    console.log('Line 6:', lines[6]);
    console.log('Line 7:', lines[7]);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
