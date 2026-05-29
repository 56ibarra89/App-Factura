import { apiClient } from './src/config/apiClient';

async function test() {
  try {
    const res = await apiClient('/mesas/config', {
      method: 'POST',
      body: JSON.stringify([
        { id: 1, name: "Primera Planta", tableCount: 15 },
        { id: 2, name: "Segunda Planta", tableCount: 10 }
      ])
    });
    console.log("SUCCESS:", res);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
test();
