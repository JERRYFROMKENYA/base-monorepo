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