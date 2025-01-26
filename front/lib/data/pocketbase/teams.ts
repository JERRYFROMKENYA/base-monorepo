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