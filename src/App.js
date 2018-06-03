import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import Table from 'react-handsontable'
import Hotkeys from 'react-hot-keys'
import Clipboard from 'clipboard'
import firebase from 'firebase/app'
import 'firebase/firestore'
import randomize from 'lodash.random'
import firebaseConfig from './firebase'

const Wrapper = styled.div`
  width: 70%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 3vh 0 0;
`

const Title = styled.h1`
  font-size: 32px;
  font-weight: 400;
  text-align: center;
  margin-bottom: 3px;
  `

const Description = styled.div`
  font-size: 18px;
  text-align: center;
  margin-bottom: 5px;
`

const Tip = styled.div`
  font-size: 13px;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.8;

  code {
    background-color: rgba(0,0,0,0.1);
    border: 1px solid rgba(0,0,0,0.2);
    box-shadow: 1px 1px 0px 0px inset rgba(255, 255, 255, 0.54);
    padding: 3px 5px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: sans-serif;
    font-weight: 600;
    font-size: 10px;
  }
`

const TablePlaceholder = styled.div`
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-align: center;
  font-size: 12px;
  opacity: 0.5;
`

const CopyElement = styled.button`
  visibility: hidden;
  transform: translateY(-100%);
`

class App extends Component {
  state = {
    data: [],
    longtail: false,
    loading: false
  }

  constructor(props) {
    super(props)
    
    firebase.initializeApp(firebaseConfig)
    this.db = firebase.firestore()
    this.db.settings({
      timestampsInSnapshots: true
    })

    this.copyEl = React.createRef()
  }

  componentDidMount() {
    new Clipboard(this.copyEl)
    setTimeout(() => {
      this.fetch()
    }, 200)
  }

  fetch = () => {
    const minNumber = randomize(0, 100000)
    const maxNumber = randomize(minNumber, 100000)
    let state = Object.assign({}, this.state)

    state.loading = true
    this.setState({
      ...state
    })

    this.db
      .collection('keywords')
      .where('seed', '>=', minNumber)
      .where('seed', '<=', maxNumber)
      .limit(100)
      .get()
      .then(snapshot => {
        const data = []

        snapshot.forEach(doc => {
          const { keyword } = doc.data()
          let finalKeyword = keyword
            .split(' ')
            .filter(item => !['ideas', 'and', 'with'].includes(item))
    
          data.push([finalKeyword.join(' ')])
        })
    
        state.loading = false
        state.data = data

        this.setState({
          ...state
        })
      }).catch(err => {
        throw err
      })
  }

  spaceKeyUp = (key, event) => {
    event.preventDefault()
    this.fetch()
  }

  copyAll = (key, event) => {
    event.preventDefault()
    this.copyEl.click()
  }

  render() {
    return (
      <Fragment>
        <Hotkeys
          keyName="space"
          onKeyDown={(k,e) => e.preventDefault()}
          onKeyUp={this.spaceKeyUp} />
        <Hotkeys
          keyName="ctrl+shift+c,cmd+shift+c"
          onKeyDown={(k,e) => e.preventDefault()}
          onKeyUp={this.copyAll} />
        <CopyElement
          data-clipboard-text={this.state.data.join('\n')}
          innerRef={component => this.copyEl = component} />

        <Wrapper>
          <Title>Cozy Space</Title>
          <Description>Random &quot;Home Design&quot;&mdash;Related Topics Keyword Generator. <a href="https://github.com/oknoorap/cozyspace" rel="noopener noreferrer" target="_blank">Repo</a></Description>
          <Tip>
            Press <code>Space</code> to generate new keyword.<br />
            Press<code>ctrl/cmd+shift+c</code> to copy all keyword.<br />
          </Tip>

          {
            this.state.data.length === 0 || this.state.loading
              ? <TablePlaceholder>Fetching Data..., waiting so long? press space again.</TablePlaceholder>
              : <Table data={this.state.data} readOnly={true} height="340" stretchH="all" />
          }
        </Wrapper>
      </Fragment>
    )
  }
}

export default App
