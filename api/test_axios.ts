import axios from 'axios';

async function test() {
  const params = new URLSearchParams({
    Brand: 'CC228Q2R',
    Country: 'FR',
    PostCode: '75015',
    ColLivMod: '24R',
    NbResults: '12',
    SearchFar: '75',
  });
  params.append('City', 'Paris');
  const url = `https://widget.mondialrelay.com/parcelshop-picker/v4_0/services/parcelshop-picker.svc/SearchPR?${params.toString()}`;
  console.log("URL:", url);

  try {
    const response = await axios.get(url);
    console.log("Response:", response.data);
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

test();
