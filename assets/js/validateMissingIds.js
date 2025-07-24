function validatePlayers(players) {
  const missingIds = players.filter(p => !p.id && p.id !== 0);
  const idMap = new Map();
  const duplicateIds = [];

  players.forEach(player => {
    if (idMap.has(player.id)) {
      const existingName = idMap.get(player.id);
      if (existingName !== player.name) {
        duplicateIds.push({
          id: player.id,
          names: [existingName, player.name],
          event: player.event,
          month: player.month
        });
      }
    } else {
      idMap.set(player.id, player.name);
    }
  });

  return { missingIds, duplicateIds };
}

// Eksempel på bruk
fetch('AL_April.json')
  .then(res => res.json())
  .then(players => {
    const result = validatePlayers(players);
    console.log("Manglende ID-er:", result.missingIds.length);
    console.log("Dupliserte ID-er med ulike navn:", result.duplicateIds);
  });
