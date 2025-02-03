

export async function addInterestedPlayers(pb:any,user: any, interestedPlayers:any) {
  try {
    for (let player of interestedPlayers) {
      let playerRes = await pb.collection('interested_players').create({
        playerId: player.person_id,
        user: user.id,
        favorite: false
      })
    }
  } catch (e) {
    console.error('Error creating interested players:', e)
  }
}

export async function getInterestedPlayers(pb:any,user: any) {
  try {
    const players = await pb.collection('interested_players').getFullList({filter:`user="${user.id}"`
  })
    return players
  } catch (e) {
    console.error('Error fetching interested players:', e)
    return []
  }
}


export async function removeInterestedPlayers(pb:any,user: any, interestedPlayers:any) {
  try {
    for (let player of interestedPlayers) {
      let playerRes = await pb.collection('interested_players').delete(`user="${user.id}" && playerId="${player.person_id}"`)
    }
  } catch (e) {
    console.error('Error deleting interested players:', e)
  }
}