export async function addInterestedTeams(pb:any,user: any, interestedTeams:any) {
  try {
    for (let team of interestedTeams) {
      let teamRes = await pb.collection('interested_teams').create({
        teamId: team.id,
        user: user.id,
        favorite: false
      })
    }
  } catch (e) {
    console.error('Error creating interested teams:', e)
  }

}


export async function getInterestedTeams(pb:any, user: any) {
  try {
    const interestedTeams = await pb.collection('interested_teams').getFullList({
      filter: `user="${user.id}"`
    })
    console.log('interested teams:', interestedTeams.length)
    return interestedTeams
  }catch (e) {
    console.log(e)
    return[]
  }

}


export async function removeInterestedTeams(pb:any, user: any, interestedTeams:any) {
  try {
    for (let team of interestedTeams) {
      let teamRes = await pb.collection('interested_teams').delete(`user="${user.id}" && teamId="${team.id}"`)
    }
  } catch (e) {
    console.error('Error deleting interested teams:', e)
  }
}