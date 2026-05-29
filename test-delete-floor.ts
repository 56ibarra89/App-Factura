import { apiClient } from './src/config/apiClient';

async function test() {
  try {
    const current = await apiClient('/mesas/config');
    console.log("Current floors:", current.length);
    
    // remove floor with id 2
    const next = current.filter((f: any) => f.id !== 2);
    
    const res = await apiClient('/mesas/config', {
      method: 'POST',
      body: JSON.stringify(next)
    });
    console.log("Saved floors:", res.length);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
test();
