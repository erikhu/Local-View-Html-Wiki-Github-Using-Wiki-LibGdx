Contributing to libgdx is easy:

  * Fork libgdx on http://github.com/libgdx/libgdx
  * Learn how to [[Work with the source | Running Demos & Tests]]
  * Hack away and send a pull request on Github!

### API Changes & Additions ###
If you modify a public API, or add a new one, make sure to add these changes to the [CHANGES](https://github.com/libgdx/libgdx/blob/master/CHANGES) file in the root of the repository. In addition to the CHANGES file, such modifications are also published on the [blog](http://www.badlogicgames.com) and on [Twitter](http://www.twitter.com/badlogicgames) to reach all of the community.

If you want to poll the brains of other devs, either send a pull request and start a conversation on Github, or start a new thread in [this sub-forum](http://www.badlogicgames.com/forum/viewforum.php?f=23). You will need special forum permissions, write an e-mail to contact at badlogicgames dot com and tell me your forum id. You should also subscribe to that forum via e-mail, there's a button at the bottom of the page. You can also drop by on IRC (irc.freenode.org, #libgdx), where most core devs are lurking.

### Contributor License Agreement ###

Libgdx is licensed under the [Apache 2.0 license](http://en.wikipedia.org/wiki/Apache_License). Before we can accept code contributions, we need you to sign our [contributor license agreement](https://github.com/libgdx/libgdx/blob/master/CLA.txt). Just print it out, fill in the blanks and send a copy to contact@badlogicgames.com, with the subject `[Libgdx] CLA`.

Signing the CLA will allow us to use and distribute your code. This is a non-exclusive license, so you retain all rights to your code. It's a fail-safe for us should someone contribute essential code and later decide to take it back.

### Eclipse Formatter ###

If you work on libgdx code, we require you to use the [Eclipse formatter](https://github.com/libgdx/libgdx/blob/master/eclipse-formatter.xml) located in the root directory of the repository.

Failure to use the formatter will result in Nate being very upset.

If you are using IntelliJ IDEA, you can still make use of the eclipse code formatter:
see: [this article](http://blog.jetbrains.com/idea/2014/01/intellij-idea-13-importing-code-formatter-settings-from-eclipse/?utm_source=hootsuite&utm_campaign=hootsuite)

### Code Style ###

Libgdx does not have an official coding standard. We mostly follow the usual Java style, and so should you.

A few things we'd rather not like to see:

  * underscores in any kind of identifier
  * [Hungarian notation](http://en.wikipedia.org/wiki/Hungarian_notation)
  * Prefixes for fields or arguments
  * Curly braces on new lines

If you modify an existing file, follow the style of the code in there. Curly braces may be omitted if it does not hurt readability.

If you create a new file, make sure to add the Apache file header, as seen [here](https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/Application.java).

If you create a new class, please add at least class documentation that explains the usage and scope of the class. You can omit Javadoc for methods that are self-explanatory.

If your class is explicitly thread-safe, mention it in the Javadoc. The default assumption is that classes are not thread-safe, to reduce the number of costly locks in the code base.

### Cross-platform compatibility ###

The GWT backend [doesn't support](http://www.gwtproject.org/doc/latest/DevGuideCodingBasicsCompatibility.html) all Java features. When writing generic code, please be aware of some common limitations:
  * Formatting. String.format() is unavailable, use StringBuilder instead or concatenate Strings directly.
  * Regular expressions. A basic emulation of [Pattern](https://github.com/libgdx/libgdx/blob/master/backends/gdx-backends-gwt/src/com/badlogic/gdx/backends/gwt/emu/java/util/regex/Pattern.java) and [Matcher](https://github.com/libgdx/libgdx/blob/master/backends/gdx-backends-gwt/src/com/badlogic/gdx/backends/gwt/emu/java/util/regex/Matcher.java) is provided.
  * Reflection. Use the utilities in [com.badlogic.gdx.utils.reflect](https://github.com/libgdx/libgdx/tree/master/gdx/src/com/badlogic/gdx/utils/reflect) package instead.
  * Multithreading. There is only support for [Timers](https://github.com/libgdx/libgdx/tree/master/gdx/src/com/badlogic/gdx/utils/Timer.java).

If you add any new classes, determine if they are compatible with GWT and add either include or exclude elements to the [GWT module](https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx.gwt.xml).

Some classes (such as Matrix4 or BufferUtils) are emulated in the GWT backend due to certain compatibility requirements or native code. If you modify any these classes, please make sure that your changes get ported to the emulated version.

### Performance Considerations ###

Libgdx is meant to run on both desktop and mobile platforms, including browsers (JavaScript!). While the desktop HotSpot VM can take quite a beating in terms of unnecessary allocations, Dalvik and consorts don't.

A couple of guidelines:

  * Avoid temporary object allocation wherever possible
  * Do not make defensive copies
  * Avoid locking, libgdx classes are by default not thread-safe unless explicitly specified
  * Do not use boxed primitives
  * Use the collection classes in the [com.badlogic.gdx.utils package](https://github.com/libgdx/libgdx/tree/master/gdx/src/com/badlogic/gdx/utils)
  * Do not perform argument checks for methods that may be called thousands of times per frame
  * Use pooling if necessary, if possible, avoid exposing the pooling to the user as it complicates the API

### Git ###

Most of the libdgx team members are Git novices, as such we are just learning the ropes ourselves. To lower the risk of getting something wrong, we'd kindly ask you to keep your pull requests small if possible. A change-set of 3000 files is likely not to get merged.

We do open new branches for bigger API changes. If you help out with a new API, make sure your pull request targets that specific branch.

Pull requests for the master repository will be checked by multiple core contributors before inclusion. We may reject your pull requests to master if we do not deem them to be ready or fitting. Please don't take offense in that case. Libgdx is used by thousands of projects around the world, we need to make sure things stay somewhat sane and stable.

LibGDX uses a forked public project methodology. [Here is a concise tutorial](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#Forked-Public-Project) to help you get aquainted with the relevant Git commands for this project type. 