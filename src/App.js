import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import Table from 'react-handsontable'
import Hotkeys from 'react-hot-keys'
import Clipboard from 'clipboard'
import randomize from 'lodash.random'

const Container = styled.div`
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

const Placeholder = styled.div`
  min-height: 350px;
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

const Wrapper = props => (
  <Container>
    <Title>Cozy Space</Title>
    <Description>Random &quot;Home Design&quot;&mdash;Related Topics Keyword Generator. <a href="https://github.com/oknoorap/cozyspace" rel="noopener noreferrer" target="_blank">Repo</a></Description>
    <Tip>
      Press <code>Space</code> to generate new keyword.<br />
      Press<code>ctrl/cmd+shift+c</code> to copy all keyword.<br />
    </Tip>
    {props.children}
  </Container>
)

class App extends Component {
  state = {
    data: [],
    longtail: false,
    loading: false,
    error: false,
    errorMsg: ''
  }

  constructor(props) {
    super(props)
    this.copyEl = React.createRef()
  }

  componentDidMount() {
    if (!this.props.maintenance) {
      new Clipboard(this.copyEl)
      this.fetch()
    }
  }

  fetch = () => {
    const minNumber = randomize(0, 100000)
    const maxNumber = randomize(0, 100000)
    const state = Object.assign({}, this.state)

    state.loading = true
    this.setState({
      ...state
    })

    this.props.db
      .collection('keywords')
      .where('seed', '>=', Math.min(minNumber, maxNumber))
      .where('seed', '<=', Math.max(minNumber, maxNumber))
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
        state.error = true
        state.errorMsg = err.message

        this.setState({
          ...state
        })
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
    if (this.props.maintenance) {
      return (
        <Wrapper>
          <Placeholder>
            Doing maintenance
          </Placeholder>
        </Wrapper>
      )
    }

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
          {
            this.state.data.length === 0 || this.state.loading
              ? <Placeholder>
                {
                  this.state.error
                    ? this.state.errorMsg
                    : 'Fetching Data..., waiting so long? press space again.'
                }
              </Placeholder>
              : <Table data={this.state.data} readOnly={true} height="340" stretchH="all" />
          }
        </Wrapper>
      </Fragment>
    )
  }
}

export default App
