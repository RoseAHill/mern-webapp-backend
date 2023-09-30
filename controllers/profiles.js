import { Profile } from '../models/profile.js'

async function index(req, res) {
  try {
    const profiles = await Profile.find({})
    res.json(profiles)
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
}

async function changeScreenName(req, res) {
  try {
    const profile = await Profile.findById(req.params.id)

    profile.screenname = req.body.newName
    
    await profile.save()
    res.status(201).json(profile.screenname)
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
}

export { index, changeScreenName }