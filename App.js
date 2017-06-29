import React from 'react';
import { StyleSheet, Text, View, ListView, TouchableOpacity } from 'react-native';

class MyComponent extends React.Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      cardList: [],
      deckList: [],
      cardIndex: [],
      cardText: "",
      loading: true,
      reverse: false,
      pickedDeck: false,
      dataSource: ds.cloneWithRows(["1", "2", "3"])
    }
  }

  loadDeckJson() {
    fetch('http://localhost:8000/decks').then((response) => {
      response.json().then((responseJson) => {
        this.setState({
          loading: false,
          dataSource: this.state.dataSource.cloneWithRows(responseJson.decks),
          deckList: responseJson.decks
        });
      })
    }).done();
  }

  loadCardJson(deckId) {
    fetch('http://localhost:8000/decks/'+deckId).then((response) => {
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
    }).done();
  }

  componentDidMount() {
    console.log("mounted")
    this.loadDeckJson()
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  renderCardView() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={{
          flex:0.9,
          width:400,
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
          width:400,
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
    console.log("Hello world!");
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
    if(this.state.loading) {
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
