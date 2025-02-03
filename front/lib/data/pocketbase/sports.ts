export async function addInterestedSports(pb:any,user: any, interestedSports:any){
  try {
    for (let sport of interestedSports) {
      let sportRes = await pb.collection('interested_sports').create({
        sportId: sport.id,
        user: user.id,
        favorite: false
      })
    }
  } catch (e) {
    console.error('Error creating interested sports:', e)
  }
}


export async function getInterestedSports(pb:any,user: any){
  try {
    const sports = await pb.collection('interested_sports').getFullList({filter:`user="${user.id}"` })
    return sports
  } catch (e) {
    console.error('Error fetching interested sports:', e)
    return []
  }
}


export async function removeInterestedSports(pb:any,user: any, interestedSports:any){
  try {
    for (let sport of interestedSports) {
      let sportRes = await pb.collection('interested_sports').delete(`user="${user.id}" && sportId="${sport.id}"`)
    }
  } catch (e) {
    console.error('Error deleting interested sports:', e)
  }
}