import React from 'react'
import {
  Navigator,
  StyleSheet,
  PropTypes,
  View,
  Text,
  Image
} from 'react-native'
import routes from './routes'

const App = React.createClass({
  render() {
    return <Navigator
      initialRoute={routes[0]}
      renderScene={this.renderScene}
    />
  },

  renderScene(route, navigator) {
    return React.createElement(route.screen, {
      route,
      navigator,
      routes,
    });
  }
})

export default App;
