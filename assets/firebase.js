import app from '../plugins/firebase.js'
import { collection, addDoc, getDocs, getFirestore, serverTimestamp, query, where, updateDoc, doc } from 'firebase/firestore'

const db = getFirestore(app)

// main.jsでfirebaseの処理として可視化したいためexport default内に関数を含める
export default {
  // payload{serverId,serverName,textChannelId}
  async createVoiceChannel(payload) {
    payload.createdAt = serverTimestamp()
    await addDoc(collection(db, 'voiceChannels'), payload)
  },
  async findVoiceChannel(serverId) {
    const q = query(collection(db, 'voiceChannels'), where('serverId', '==', serverId))
    const querySnapshot = await getDocs(q)
    const docs = []
    if (querySnapshot.size) {
      querySnapshot.forEach(doc => {
        docs.push(doc.data())
      })
    }
    return docs
  },
  async changeTextChannelId(serverId, textChannelId) {
    const q = query(collection(db, 'voiceChannels'), where('serverId', '==', serverId))
    const querySnapshot = await getDocs(q)
    let docId = ''
    querySnapshot.forEach(async doc => {
      docId = doc.id
    })
    const targetDoc = doc(db, 'voiceChannels', docId)
    await updateDoc(targetDoc, {
      textChannelId
    })
  }
}