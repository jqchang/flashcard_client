import React from 'react';
import { StyleSheet, Text, View, ListView, TouchableOpacity, Dimensions } from 'react-native';

// DEVELOPMENT ONLY
const API_URL = 'http://54.183.172.164' // deployed
const ALT_API_URL = 'http://localhost:8000' // Simulator
const FONTSIZE = 20

// const DEV_WIDTH = Dimensions.get('window').width

class MainView extends React.Component {
  constructor(props) {
    super(props);
    console.log("Entered MyComponent constructor")
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      cardList: [],
      deckList: [],
      cardIndex: [],
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

  componentDidMount() {
    this.loadDeckJson()
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
            nextCard = Math.floor(Math.random()*this.state.cardList.length)
            this.setState({
              reverse: false,
              cardIndex: nextCard,
              cardText: this.state.cardList[nextCard].side1,
            })
          }
        }}>
          <Text style={[styles.plainText, this.nightMode(true)]}>{this.state.cardText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomBar, this.nightMode()]} onPress={()=>{
          this.setState({
            pickedDeck: false,
            reverse: false,
          })
        }}>
          <Text style={[styles.plainText, this.nightMode(true)]}>Back to Deck List</Text>
        </TouchableOpacity>
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
          this.setState({
            night:!this.state.night,
          });
          this.loadDeckJson()
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
  header: {flex:0.05},
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
