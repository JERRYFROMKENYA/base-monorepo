
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


export async function getInterestedLeagues(pb:any,user: any){
  try {
    const leagues = await pb.collection('interested_leagues').getFullList({filter:`user="${user.id}"`
    })
    return leagues
  } catch (e) {
    console.error('Error fetching interested leagues:', e)
    return []
  }
}

export async function removeInterestLeagues(pb:any,user: any, interestedLeagues:any){
  try {
    for (let league of interestedLeagues) {
      let leagueRes = await pb.collection('interested_leagues').delete(`user="${user.id}" && leagueId="${league.id}"`)
    }
  } catch (e) {
    console.error('Error deleting interested leagues:', e)
  }
}