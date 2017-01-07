import React from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  View,
  Text,
  Image,
  Dimensions
} from 'react-native';
import Camera from 'react-native-camera';

const { height, width } = Dimensions.get('window')

export default class Example extends React.Component {
  constructor(props) {
    super(props);

    // set up a camera ref
    this.camera = null;

    // Set up animations
    this.animatedValue = new Animated.ValueXY()

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,

      onPanResponderMove: Animated.event([null,
        { dx: this.animatedValue.x, dy: this.animatedValue.y }
      ]),

      onPanResponderRelease: () => {
        Animated.spring(
          this.animatedValue,
          { toValue: { x: 0, y: 0 } }
        ).start()
      }
    })

    this.interpolatedRotateAnimation = this.animatedValue.x.interpolate({
      inputRange: [0, width/2, width],
      outputRange: ['-360deg', '0deg', '360deg']
    })

    // Initial state
    this.state = {
      camera: {
        aspect: Camera.constants.Aspect.fill,
        type: Camera.constants.Type.back,
        orientation: Camera.constants.Orientation.auto,
      }
    };

    // Bind component methods
    this.goBack = this.goBack.bind(this)
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
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={this.state.camera.aspect}
          type={this.state.camera.type}
          flashMode={this.state.camera.flashMode}
          defaultTouchToFocus
          mirrorImage={false}
        />

        <Image
          source={this.props.route.params.pokemon.image}
          style={{
            position: 'absolute',
            top: height/3,
            bottom: height/3,
            right: width/3,
            left: width/3
          }}
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
                { translateX: this.animatedValue.x },
                { translateY: this.animatedValue.y },
                { rotate: this.interpolatedRotateAnimation }
              ]
            }}
            { ...this.panResponder.panHandlers }
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
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
});
