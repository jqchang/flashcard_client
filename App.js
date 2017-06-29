import React from 'react';
import { StyleSheet, Text, View, ListView, TouchableOpacity } from 'react-native';

// DEVELOPMENT ONLY
const API_URL = 'http://localhost:8000' // iOS simulator, web client
const ALT_API_URL = 'http://10.0.2.2:8000' // Android virtual device simulator


class MyComponent extends React.Component {
  constructor() {
    super();
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
      dataSource: ds.cloneWithRows(["1", "2", "3"])
    }
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
    console.log("Returning loading view")
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  renderErrorView() {
    return (
      <View style={styles.container}>
        <Text>Error loading Flashcards!</Text>
      </View>
    );
  }

  renderCardView() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={{
          flex:0.9,
          width:350,
          borderWidth:1,
          borderColor:"black",
          alignSelf:"stretch",
          alignItems:"center",
          justifyContent:"center"
        }} onPress={()=>{
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
          <Text>{this.state.cardText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{
          flex:0.1,
          width:350,
          borderWidth:1,
          borderColor:"black",
          alignSelf:"stretch",
          alignItems:"center",
          justifyContent:"center"
        }} onPress={()=>{
          this.setState({
            pickedDeck: false,
            reverse: false,
          })
        }}>
          <Text>Back to Deck List</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderListView() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={(rowData) =>
          <TouchableOpacity onPress={()=>{
            this.loadCardJson(rowData.id)
          }}>
            <Text>{rowData.name+" - "+rowData.num_cards+" card(s)"}</Text>
          </TouchableOpacity>}
      />
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
        <View style={{flex:0.05}}></View>
        <MyComponent/>
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
});
