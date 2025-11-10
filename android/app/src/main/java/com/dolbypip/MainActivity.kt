package com.dolbypip

import android.content.res.Configuration
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  private var delegate: DefaultReactActivityDelegate? = null

  override fun getMainComponentName(): String = "DolbyPIP"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    val defaultDelegate = DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
    delegate = defaultDelegate
    return defaultDelegate
  }

  override fun onPictureInPictureModeChanged(
      isInPictureInPictureMode: Boolean,
      newConfig: Configuration
  ) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    emitToJs("DolbyPIP_onPictureInPictureModeChanged", isInPictureInPictureMode)
  }

  private fun emitToJs(eventName: String, isInPictureInPictureMode: Boolean) {
    val reactContext = delegate?.reactHost?.currentReactContext
    reactContext
        ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        ?.emit(eventName, isInPictureInPictureMode)
  }
}
