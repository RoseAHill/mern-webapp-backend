import jwt from 'jsonwebtoken'

import { User } from '../models/user.js'
import { Profile } from '../models/profile.js'

async function signup(req, res) {
  try {
    if (!process.env.SECRET) throw new Error('no SECRET in back-end .env')

    const user = await User.findOne({ email: req.body.email })
    if (user) throw new Error(`Account with email ${req.body.email} already exists`)

    const username = await User.findOne({ username: req.body.username })
    if (username) throw new Error(`Account with username ${req.body.username} already exists`)

    const newProfile = await Profile.create(req.body)
    req.body.profile = newProfile._id
    const newUser = await User.create(req.body)

    const token = createJWT(newUser)
    res.status(200).json({ token })
  } catch (err) {
    console.error(err)
    try {
      if (req.body.profile) {
        await Profile.findByIdAndDelete(req.body.profile)
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json({ err: err.message })
    }
    res.status(500).json({ err: err.message })
  }
}

async function login(req, res) {
  try {
    if (!process.env.SECRET) throw new Error('no SECRET in back-end .env')

    const user = !req.body.email ?
      await User.findOne({ username: req.body.username })
      :
      await User.findOne({ email: req.body.email })

    const isMatch = await user.comparePassword(req.body.password)
    if (!isMatch) throw new Error('Incorrect password')

    const token = createJWT(user)
    res.json({ token })
  } catch (err) {
    handleAuthError(err, res)
  }
}

async function changePassword(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) throw new Error('User not found')

    const isMatch = user.comparePassword(req.body.password)
    if (!isMatch) throw new Error('Incorrect password')

    user.password = req.body.newPassword
    await user.save()

    const token = createJWT(user)
    res.json({ token })
    
  } catch (err) {
    handleAuthError(err, res)
  }
}

/* --== Helper Functions ==-- */

function handleAuthError(err, res) {
  console.log(err)
  const { message } = err
  if (message === 'User not found' || message === 'Incorrect password') {
    res.status(401).json({ err: message })
  } else {
    res.status(500).json({ err: message })
  }
}

function createJWT(user) {
  return jwt.sign({ user }, process.env.SECRET, { expiresIn: '24h' })
}

export { signup, login, changePassword }