export async function viewHomeRun(user:any,pb:any,play_id:string){
  const data = {
    "play_id": play_id,
    "user": user.id
  };
  const record = await pb.collection('watch_history').create(data);
  return !!record
}

export async function getWatchedVideos(user:any,pb:any){
  try{
    const records = await pb.collection('watch_history').getFullList({ filter: `user="${user.id}"` })
    return records ? records : []
  }
  catch (e) {
    console.log(e)
    return []
  }
}

export async function likeHomeRun(user:any,pb:any,play_id:string){
try {
  const record = await pb.collection('liked_home_runs').getFirstListItem(`user=${user.id}&&play_id=${play_id}`);
  if (record) {
    return true
  }
}catch (e) {
  console.log(e)
  return false
}

  try{
    const data = {
      'play_id': play_id,
      'user': user.id,
    }
    const record = await pb.collection('liked_home_runs').create(data)
    return !!record
  }catch (e) {
    console.log(e)
    return false
  }
}