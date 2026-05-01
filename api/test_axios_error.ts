import axios from 'axios';

async function test() {
  const url = `https://widget.mondialrelay.com/parcelshop-picker/v4_0/services/parcelshop-picker.svc/SearchPR?Brand=CC228Q2R&Country=FR&PostCode=&ColLivMod=24R&NbResults=12&SearchFar=75`;

  try {
    const response = await axios.get(url);
    console.log("Success! Status:", response.status);
    console.log("Data:", response.data);
  } catch (error: any) {
    console.error("Caught error! Status:", error.response?.status);
    console.error("Data:", error.response?.data);
  }
}

test();
