fetch('http://localhost:3000/en/account', { redirect: 'manual' }).then(async res => {
  console.log('Status:', res.status, res.statusText);
  if (res.status === 307 || res.status === 308) {
    console.log('Redirect:', res.headers.get('location'));
  }
}).catch(console.error);
