import React from 'react'
import {
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  View,
  Text,
  Image,
  Dimensions,
  DeviceEventEmitter
} from 'react-native'
import { Gyroscope } from 'NativeModules'
import Camera from 'react-native-camera'

const { height, width } = Dimensions.get('window')

Gyroscope.setGyroUpdateInterval(0.1)

export default class Example extends React.Component {
  constructor(props) {
    super(props)

    // set up refs
    this.gyroTracker = null

    // Set up animations
    this.animatedPokemonPosition = new Animated.ValueXY()
    this.pokemonPosition = { x: 0, y: 0 }

    this.animatedPokeball = new Animated.ValueXY()

    this.interpolatedRotateAnimation = this.animatedPokeball.x.interpolate({
      inputRange: [0, width/2, width],
      outputRange: ['-360deg', '0deg', '360deg']
    })

    // Set up touch handlers
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,

      onPanResponderMove: Animated.event([null,
        { dx: this.animatedPokeball.x, dy: this.animatedPokeball.y }
      ]),

      onPanResponderRelease: () => {
        Animated.spring(
          this.animatedPokeball,
          { toValue: { x: 0, y: 0 } }
        ).start()
      }
    })

    // Bind component methods
    this.goBack = this.goBack.bind(this)
    this.trackGyrometer = this.trackGyrometer.bind(this)
  }

  componentDidMount() {
    Gyroscope.startGyroUpdates()

    this.gyroTracker = DeviceEventEmitter.addListener('GyroData',
      this.trackGyrometer(
        Animated.event([
          { x: this.animatedPokemonPosition.x, y: this.animatedPokemonPosition.y }
        ])
      )
    )
  }

  componentWillUnmount() {
    Gyroscope.stopGyroUpdates()
    this.gyroTracker.remove()
  }

  trackGyrometer(eventHandler) {
    return (data) => {
      this.pokemonPosition.x += ((data.rotationRate.y - 0.03) * 50)
      this.pokemonPosition.y += ((data.rotationRate.x + 0.053) * 50)

      eventHandler(this.pokemonPosition)
    }
  }

  goBack() {
    console.log(this.props.routes[0])
    this.props.navigator.pop()
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar animated hidden />

        <Camera
          style={styles.camera}
          aspect={Camera.constants.Aspect.fill}
          type={Camera.constants.Type.back}
          flashMode={Camera.constants.FlashMode.off}
        />

        <Animated.Image
          source={this.props.route.params.pokemon.image}
          style={[
            {
              position: 'absolute',
              top: height/3,
              bottom: height/3,
              right: width/3,
              left: width/3
            },
            {
              transform: [
                { translateX: this.animatedPokemonPosition.x },
                { translateY: this.animatedPokemonPosition.y }
              ]
            }
          ]}
        />

        <View style={[styles.overlay, styles.topOverlay]}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={this.goBack}
          >
            <Text style={styles.cancelText}>X</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.overlay, styles.bottomOverlay]}>
          <Animated.Image
            source={require('../img/pokeball.png')}
            style={{
              transform: [
                { translateX: this.animatedPokeball.x },
                { translateY: this.animatedPokeball.y },
                { rotate: this.interpolatedRotateAnimation }
              ]
            }}
            { ...this.panResponder.panHandlers }
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bottomOverlay: {
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  cancelButton: {
    padding: 15,
  },
  cancelText: {
    color: 'white'
  },
  pokemon: {
    position: 'absolute',
  }
})
