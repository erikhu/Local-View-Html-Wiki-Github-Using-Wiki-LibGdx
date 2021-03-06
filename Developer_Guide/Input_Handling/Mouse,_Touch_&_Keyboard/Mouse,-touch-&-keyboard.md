The main input devices libgdx supports are the mouse on the desktop/browser, touch screens on Android and keyboards. Let's review how libgdx abstracts those.

## Keyboard ##
Keyboards signal user input by generating events for pressing and releasing a key. Each event carries with it a key-code that identifies the key that was pressed/released. These key-codes differ from platform to platform. Libgdx tries to hide this fact by providing its own key-code table, see the [Keys](http://libgdx.badlogicgames.com/nightlies/docs/api/com/badlogic/gdx/Input.Keys.html) [(source)](https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/Input.java#L63) class. You can query which keys are currently being pressed via [[Polling]].

Key-codes alone do not give us information about which character the user actually entered. This information is often derived from the state of multiple keys, e.g. the character 'A' is generated by the keys 'a' and 'shift' being pressed simultaneously. In general, deriving characters from the keyboard's state (which keys are down) is non-trivial. Thankfully, the operating system usually has a means to hook up an event listener that not only reports key-code events (key pressed/key released), but also characters. Libgdx uses this mechanism under the hood to provide you with character information. See [[Event Handling]].

## Mouse & Touch ##
Mouse and touch input allow the user to point at things on the screen. Both input mechanisms report the location of interaction as 2D coordinates relative to the upper left corner of the screen, with the positive x-axis pointing to the right and the y-axis pointing downward.

Mouse input comes with additional information, namely which button was pressed. Most mice feature a left and a right mouse button as well as a middle mouse button. In addition, there's often a scroll wheel which can be used for zooming or scrolling in many applications.

Touch input does not have the notion of buttons and is complicated by the fact that multiple fingers might be tracked depending on the hardware. First generation Android phones only supported single-touch. Starting with phones like the Motorola Droid, multi-touch became a standard feature on most Android phones.

Note that touch can be implemented quite differently on different devices. This can affect how pointer indexes are specified and released and when touch events are fired. Be sure to test your control scheme on as many devices as possible. There are also many input test apps available in the market which can help determine how a particular device reports touch and aid in designing a control scheme that works best across a range of devices.

Libgdx abstracts unified handling of mouse and touch input. We view mouse input as a specialized form of touch input. Only a single finger is tracked, and in addition to coordinates we also report which buttons were pressed. For touch input we support tracking multiple fingers (pointers) and report the left mouse button for all events.

Note that on Android the coordinate system is either relative to portrait or landscape mode, depending on what you set for your application.

Mouse and touch input can either be [[polled | Polling]] or processed via [[Event Handling]]