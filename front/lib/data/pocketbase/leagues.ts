
export async function addInterestLeagues(pb:any,user: any, interestedLeagues:any){
  try {
    for (let league of interestedLeagues) {
      let leagueRes = await pb.collection('interested_leagues').create({
        leagueId: league.id,
        user: user.id,
        favorite: false
      })
    }
  } catch (e) {
    console.error('Error creating interested leagues:', e)
  }
}