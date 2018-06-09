import React from 'react'
import ReactDOM from 'react-dom'
// import firebase from 'firebase/app'
// import 'firebase/firestore'
// import firebaseConfig from './firebase'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import './global.css'

ReactDOM.render(<App maintenance={true} />, document.getElementById('root'))
registerServiceWorker()
