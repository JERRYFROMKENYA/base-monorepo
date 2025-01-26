

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