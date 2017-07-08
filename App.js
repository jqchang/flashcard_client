import React from 'react';
import { StyleSheet, Text, View, ListView, TouchableOpacity, Dimensions, AsyncStorage } from 'react-native';

// DEVELOPMENT ONLY
const API_URL = 'http://54.183.172.164' // deployed
const ALT_API_URL = 'http://localhost:8000' // Simulator
const FONTSIZE = 20

// const DEV_WIDTH = Dimensions.get('window').width())

class MainView extends React.Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      cardList: [],
      deckList: [],
      cardIndex: [],
      knownCards: {},
      unknownCards: {},
      cardText: "",
      loading: true,
      error: false,
      reverse: false,
      pickedDeck: false,
      night: false,
      dataSource: ds.cloneWithRows(["1", "2"])
    }
  }

  nightMode(text) {
    nightStyle = {
      backgroundColor:"black",
      borderColor:"white",
    }
    if (text) {
      nightStyle.color = "white";
    }
    if(this.state.night){
      return nightStyle;
    }
    else return {};
  }

  loadDeckJson() {
    fetch(API_URL+'/decks').then((response) => {
      response.json().then((responseJson) => {
        this.setState({
          loading: false,
          dataSource: this.state.dataSource.cloneWithRows(responseJson.decks),
          deckList: responseJson.decks
        });
      })
    }).catch((error) => {
      fetch(ALT_API_URL+'/decks').then((response) => {
        response.json().then((responseJson) => {
          this.setState({
            loading: false,
            dataSource: this.state.dataSource.cloneWithRows(responseJson.decks),
            deckList: responseJson.decks
          });
        })
      }).catch((error) => {
        console.log(error)
        this.setState({
          error: true
        })
      })
    }).done();
  }

  loadCardJson(deckId) {
    fetch(API_URL+'/decks/'+deckId).then((response) => {
      response.json().then((responseJson) => {
        deckSize = responseJson.cards.length
        cardIndex = Math.floor(Math.random()*deckSize)
        this.setState({
          cardList: responseJson.cards,
          cardIndex: cardIndex,
          pickedDeck: true,
          cardText: responseJson.cards[cardIndex].side1,
        });
      })
    }).catch((error) => {
      fetch(ALT_API_URL+'/decks/'+deckId).then((response) => {
        response.json().then((responseJson) => {
          deckSize = responseJson.cards.length
          cardIndex = Math.floor(Math.random()*deckSize)
          this.setState({
            cardList: responseJson.cards,
            cardIndex: cardIndex,
            pickedDeck: true,
            cardText: responseJson.cards[cardIndex].side1,
          });
        })
      }).catch((error) => {
        console.log(error)
        this.setState({
          error: true
        })
      })
    }).done();
  }

  getPersistentData() {
    AsyncStorage.getAllKeys().then(value=> {
      console.log(value);
    })
    AsyncStorage.getItem('known').then(value => {
      if(value !== null) {
        // console.log("known:",value)
        for(var i of JSON.parse(value)){
          this.state.knownCards[i] = true
        }
        console.log("known:",this.state.knownCards);
      }
    }).done();
    AsyncStorage.getItem('unknown').then(value => {
      if(value !== null) {
        // console.log("unknown:",value)
        for(var i of JSON.parse(value)) {
          this.state.unknownCards[i] = true
        }
        console.log("unknown:",this.state.unknownCards);
      }
    }).done();
    AsyncStorage.getItem('night').then(value => {
      if(value !== null) {
        // console.log("night:",value)
        if(value === "true") value = true;
        else value = false;
        this.setState({night:Boolean(value)})
      }
    })
  }

  setNight = (value) => {
    this.setState({night:value})
    return AsyncStorage.setItem('night', JSON.stringify(value));
  }

  componentDidMount() {
    // DEBUG: RUN ONCE
    // AsyncStorage.clear();
    // END DEBUG
    this.getPersistentData();
    this.loadDeckJson();
  }

  renderLoadingView() {
    return (
      <View style={[styles.container, this.nightMode()]}>
        <Text style={styles.plainText}>Loading...</Text>
      </View>
    );
  }

  renderErrorView() {
    return (
      <View style={[styles.container, this.nightMode()]}>
        <Text style={[styles.plainText, this.nightMode(true)]}>Error connecting to flashcard server!</Text>
      </View>
    );
  }

  renderCardView() {
    return (
      <View style={[styles.container, this.nightMode()]}>
        <TouchableOpacity style={[styles.mainView, this.nightMode()]} onPress={()=>{
          if(!this.state.reverse) {
            this.setState({
              reverse: true,
              cardText: this.state.cardList[this.state.cardIndex].side2,
            })
          }
          else {
            this.setState({
              reverse: false,
              cardText: this.state.cardList[this.state.cardIndex].side1,
            })
          }
        }}>
          <Text style={[styles.plainText, this.nightMode(true)]}>{this.state.cardText}</Text>
        </TouchableOpacity>
        <View style={[styles.container, {flex:0.2}, this.nightMode()]}>
          <View style={[styles.container, {flexDirection:"row"}, this.nightMode()]}>
            <TouchableOpacity style={[styles.bottomBar, this.nightMode()]} onPress={()=>{
              console.log("alreadyKnow =",this.state.cardList[this.state.cardIndex].id)
              this.state.knownCards[this.state.cardList[this.state.cardIndex].id] = true;
              AsyncStorage.setItem('known', JSON.stringify(Object.keys(this.state.knownCards))).then(() => {
                var findCard = true
                while(findCard) {
                  nextCard = Math.floor(Math.random()*this.state.cardList.length)
                  if(!this.state.knownCards[this.state.cardList[nextCard].id]) {
                    findCard = false;
                  }
                  else {
                    console.log("Skipping",this.state.cardList[nextCard].id)
                  }
                }
                this.setState({
                  reverse: false,
                  cardIndex: nextCard,
                  cardText: this.state.cardList[nextCard].side1,
                })
              });
            }}>
              <Text style={[styles.plainText, this.nightMode(true)]}>Already know!</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomBar, this.nightMode()]} onPress={()=>{
              this.state.unknownCards[this.state.cardList[this.state.cardIndex].id] = true;
              AsyncStorage.setItem('unknown', JSON.stringify(Object.keys(this.state.unknownCards))).then(() => {
                console.log("Unknown:",Object.keys(this.state.unknownCards))
                var findCard = true
                while(findCard) {
                  nextCard = Math.floor(Math.random()*this.state.cardList.length)
                  if(!this.state.knownCards[this.state.cardList[nextCard].id]) {
                    findCard = false;
                  }
                  else {
                    console.log("Skipping",this.state.cardList[nextCard].id)
                  }
                }
                this.setState({
                  reverse: false,
                  cardIndex: nextCard,
                  cardText: this.state.cardList[nextCard].side1,
                })
              });
            }}>
              <Text style={[styles.plainText, this.nightMode(true)]}>Not yet...</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.bottomBar, this.nightMode()]} onPress={()=>{
            this.setState({
              pickedDeck: false,
              reverse: false,
            })
            this.loadDeckJson()
          }}>
            <Text style={[styles.plainText, this.nightMode(true)]}>Back to Deck List</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderListView() {
    return (
      <View style={[styles.container, this.nightMode()]}>
        <Text style={[styles.plainText, this.nightMode(true)]}>Available Decks:</Text>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => {
            return (
              <TouchableOpacity style={[styles.listItem, this.nightMode()]} onPress={()=>{
                this.loadCardJson(rowData.id)
              }}>
                <Text style={[styles.plainText, this.nightMode(true)]}>{rowData.name+" - "+rowData.num_cards+" card(s)"}</Text>
              </TouchableOpacity>
            )
          }}
        />
        <TouchableOpacity style={[styles.bottomBar, this.nightMode()]} onPress={()=>{
          this.setNight(!this.state.night).then(()=> {
            this.loadDeckJson()
          })
        }}>
          <Text style={[styles.plainText, this.nightMode(true)]}>
            Toggle Night Mode
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    if (this.state.error) {
      return(this.renderErrorView());
    }
    else if(this.state.loading) {
      return(this.renderLoadingView());
    }
    else if(this.state.pickedDeck) {
      return(this.renderCardView());
    }
    else {
      return(this.renderListView())
    }
  }
}

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}></View>
        <MainView/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {flex:0.025},
  plainText: {fontSize:FONTSIZE},
  mainView:{
    flex:0.9,
    width:Dimensions.get('window').width,
    borderWidth:1,
    borderColor:"black",
    alignSelf:"stretch",
    alignItems:"center",
    justifyContent:"center",
    padding:25,
  },
  bottomBar:{
    flex:0.1,
    width:Dimensions.get('window').width,
    borderWidth:1,
    borderColor:"black",
    alignSelf:"stretch",
    alignItems:"center",
    justifyContent:"center",
    padding:25,
  },
  listItem: {
    width:Dimensions.get('window').width,
    borderWidth:1,
    borderColor:"black",
    padding:10,
  }
});
