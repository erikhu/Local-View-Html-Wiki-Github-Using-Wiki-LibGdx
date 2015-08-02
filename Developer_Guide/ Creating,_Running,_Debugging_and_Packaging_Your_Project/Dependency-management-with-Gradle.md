## Contents

* [**Useful links**] (#useful-links)
* [**Guide to build.gradle**] (#guide-to-buildgradle)
* [**Libgdx Dependencies**] (#libgdx-dependencies)
 * [Available libgdx extensions] (#libgdx-extensions)
* [**External Dependencies**] (#external-dependencies)
 * [Adding Repositories] (#adding-external-repositories)
 * [Mavenizing Local Dependencies] (#mavenizing-local-dependencies)
 * [File Dependencies] (#file-dependencies)
   * [Android pitfall] (#android-pitfall)
 * [Examples] (#external-dependencies-examples)
   * [Jar example] (#universal-tween-engine-by-jar)
    * [Mavenize locally] (universal-tween-engine-by-locally-mavenizing-maven)
* [**Declaring Dependencies with HTML**] (#gwt-inheritance)
 * [Libgdx Extension Inherits] (#libgdx-extension-inherits)
* [**Step by Step Universal Tween Engine guide**] (#step-by-step-universal-tween-engine-guide)

### Useful links
Dependency management with Gradle is easy to understand, and has many different approaches.  If you are familiar with Maven or Ivy, Gradle is fully compatible with both approaches, as well as being able to support custom approaches.  If you aren't familiar with Gradle, there are great resources on their site to learn, it is recommended you give them a read to get comfortable with Gradle.
* [Gradle's User Guide](http://www.gradle.org/docs/current/userguide/userguide.html)
* [Gradle's Depedency Management Guide](http://www.gradle.org/docs/current/userguide/dependency_management.html)
* [Declare your dependencies] (http://www.gradle.org/docs/current/userguide/dependency_management.html#sec:how_to_declare_your_dependencies)

### Guide to build.gradle
Gradle projects are managed by `build.gradle` files in their root directory. If you have used the gdx-setup.jar to build your libgdx project you will notice the structure: [Structure Example](https://github.com/libgdx/libgdx/wiki/Project-Setup-Gradle#project-layout)

The root directory, and each sub directory contains a `build.gradle` file, for clarity we will define the dependencies in the root directory's `build.gradle` file. (Note it can be done in each of the `build.gradle` scripts in the sub directories, it is just cleaner and easier to follow when it is handled all in one place)

Here is a small section of the _default_ buildscript that is generated from the setup:

_Full script you will see will differ slightly depending on what other modules you have, 
see [here](https://github.com/libgdx/libgdx/blob/master/extensions/gdx-setup/src/com/badlogic/gdx/setup/resources/core/build.gradle)_
```groovy
buildscript {
    //Defines the repositories that are required by this script, e.g. android plugin
    repositories {
        //maven central repository, needed for the android plugin
        mavenCentral()
        //repository for libgdx artifacts
        maven { url "https://oss.sonatype.org/content/repositories/snapshots/" }
    }
    //
    dependencies {
        //Adds the android gradle plugin as a dependency of this buildscript
        classpath 'com.android.tools.build:gradle:0.9+'
    }
}

allprojects {
    apply plugin: "eclipse"
    apply plugin: "idea"
    
    version = "1.0"
    ext {
        appName = "%APP_NAME%"
        gdxVersion = "1.0-SNAPSHOT"
        roboVMVersion = "0.0.10"
    }
    
    repositories {
        //Defines all repositories needed for all projects
        mavenLocal();
        mavenCentral()
        maven { url "https://oss.sonatype.org/content/repositories/snapshots/" }
    }
}

project(":core") {
    apply plugin: "java"
    
    dependencies {
        //Defines dependencies for the :core project, in this example the gdx depdendency
        compile "com.badlogicgames.gdx:gdx:$gdxVersion"
    }
}

project(":desktop") {
    apply plugin: "java"
    
    dependencies {
    //Defines dependencies for the :desktop project, adds dependency on the :core project as well as 
    //The gdx lwjgl backend and native dependencies
        compile project(":core")
        compile "com.badlogicgames.gdx:gdx-backend-lwjgl:$gdxVersion"
        compile "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-desktop"
    }
}

project(":android") {
    apply plugin: "android"

    configurations { natives }

    dependencies {
        //defines dependencies for the :android project, depends on the :core project,
        //and also the android backends and all platform natives. Note the 'natives' classifier
        //in this project
        compile project(":core")
        compile "com.badlogicgames.gdx:gdx-backend-android:$gdxVersion"        
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-x86"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-armeabi"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-armeabi-v7a"
    }
}

```

### Libgdx Dependencies
Dependencies are configured in the **root** `build.gradle` file as shown in the build.gradle guide above.
In order to add an external dependency to a project, you must declare the dependency correctly under the correct part of the build.script.

(Some) Libgdx extensions are mavenized and pushed to the maven repo, which means we can very easily pull them into our projects from the `build.gradle` file.  You can see in the list [below](#libgdx-extensions) of the format that these dependencies take. 
If you are familiar with maven, notice the format:
```groovy
compile '<groupId>:<artifactId>:<version>:<classifier>'
```

Let's take a quick example to see how this works with the root `build.gradle` file. 

As mentioned earlier, you do not need to  modify the individual `build.gradle` files in each of the different platform-specific folders (e.g., -desktop, -ios, -core). You only need to modify the root `build.gradle` file.

[Here](#freetypefont-gradle) we see the dependencies for the FreeType Extension, say we want our Android project to have this dependency.  We locate our `project(":android")` stub in the root directory's `build.gradle`:
```groovy
project(":android") {
    apply plugin: "android"

    configurations { natives }

    dependencies {
        compile project(":core")
        compile "com.badlogicgames.gdx:gdx-backend-android:$gdxVersion"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-x86"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-armeabi"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-armeabi-v7a"
    }
}
```

**We know our FreeType extension has declarations:**
```groovy
compile "com.badlogicgames.gdx:gdx-freetype:$gdxVersion"
natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-armeabi"
natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-armeabi-v7a"
natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-x86"
```

**So all we need to do is whack it in the dependencies stub**

```groovy
project(":android") {
    apply plugin: "android"

    configurations { natives }

    dependencies {
        compile project(":core")
        compile "com.badlogicgames.gdx:gdx-backend-android:$gdxVersion"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-x86"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-armeabi"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-armeabi-v7a"
   
        compile "com.badlogicgames.gdx:gdx-freetype:$gdxVersion"
        natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-armeabi"
        natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-armeabi-v7a"
        natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-x86"
    }
}
```
And we are done, our android project now has the freetype dependency.
After this you will need to refresh your dependencies. Easy eh.

#### Libgdx Extensions
Mavenized libgdx extensions ready to import from the `build.gradle` script include:
* [Box2D] (#box2d-gradle)
* [Bullet] (#bullet-gradle)
* [FreeTypeFont] (#freetypefont-gradle)
* [Controllers](#controllers-gradle)
* [Tools] (#tools-gradle)
* [Box2DLights] (#box2dlights-gradle)
* [Ai] (#ai-gradle)

#### Box2D Gradle
**Core Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-box2d:$gdxVersion"
```
**Desktop Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-box2d-platform:$gdxVersion:natives-desktop"
```
**Android Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-box2d:$gdxVersion"
natives "com.badlogicgames.gdx:gdx-box2d-platform:$gdxVersion:natives-armeabi"
natives "com.badlogicgames.gdx:gdx-box2d-platform:$gdxVersion:natives-armeabi-v7a"
natives "com.badlogicgames.gdx:gdx-box2d-platform:$gdxVersion:natives-x86"
```
**iOS Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-box2d:$gdxVersion"
natives "com.badlogicgames.gdx:gdx-box2d-platform:$gdxVersion:natives-ios"
```
**HTML Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-box2d-gwt:$gdxVersion:sources"
compile "com.badlogicgames.gdx:gdx-box2d:$gdxVersion:sources"
```

***

#### Bullet Gradle
**Core Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-bullet:$gdxVersion"
```
**Desktop Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-bullet-platform:$gdxVersion:natives-desktop"
```
**Android Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-bullet:$gdxVersion"
natives "com.badlogicgames.gdx:gdx-bullet-platform:$gdxVersion:natives-armeabi"
natives "com.badlogicgames.gdx:gdx-bullet-platform:$gdxVersion:natives-armeabi-v7a"
natives "com.badlogicgames.gdx:gdx-bullet-platform:$gdxVersion:natives-x86"
```
**iOS Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-bullet:$gdxVersion"
natives "com.badlogicgames.gdx:gdx-bullet-platform:$gdxVersion:natives-ios"
```
**HTML Dependency:**
Not compatible!

***

#### FreeTypeFont Gradle
**Core Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-freetype:$gdxVersion"
```
**Desktop Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-desktop"
```
**Android Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-freetype:$gdxVersion"
natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-armeabi"
natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-armeabi-v7a"
natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-x86"
```
**iOS Dependency version 1.6.1+:**
```groovy
compile "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-ios"
```
**iOS Dependency (Old version):**
```groovy
compile "com.badlogicgames.gdx:gdx-freetype:$gdxVersion"
natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-ios"
```

**HTML Dependency:**
Not compatible!

***

#### Controllers Gradle
**Core Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-controllers:$gdxVersion"
```
**Desktop Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-controllers-desktop:$gdxVersion"
compile "com.badlogicgames.gdx:gdx-controllers-platform:$gdxVersion:natives-desktop"
```
**Android Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-controllers:$gdxVersion"
compile "com.badlogicgames.gdx:gdx-controllers-android:$gdxVersion"
```
**iOS Dependency:**
Not supported, but you can still compile and run your iOS app. Controllers just won't be available

**HTML Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-controllers:$gdxVersion:sources"
compile "com.badlogicgames.gdx:gdx-controllers-gwt:$gdxVersion"
compile "com.badlogicgames.gdx:gdx-controllers-gwt:$gdxVersion:sources"
```

***

#### Tools Gradle
**Core Dependency:**
```groovy
Dont put me in core!
```
**Desktop Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-tools:$gdxVersion"
```
**Android Dependency:**
Not compatible!

**iOS Dependency:**
Not compatible!

**HTML Dependency:**
Not compatible!

***

#### Box2DLights Gradle
* **Note:** this extension also requires the [Box2D](#box2d-gradle) extension

**Core Dependency:**
```groovy
compile "com.badlogicgames.box2dlights:box2dlights:1.3"
```
**Android Dependency:**
```groovy
compile "com.badlogicgames.box2dlights:box2dlights:1.3"
```
**HTML Dependency:**
```groovy
compile "com.badlogicgames.box2dlights:box2dlights:1.3:sources"
```

***

#### Ai Gradle

**Core Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-ai:1.5.0"
```
**Android Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-ai:1.5.0"
```
**HTML Dependency:**
```groovy
compile "com.badlogicgames.gdx:gdx-ai:1.5.0:sources"
```
and in `./html/src/yourgamedomain/GdxDefinition*.gwt.xml` add `<inherits name="com.badlogic.gdx.ai"/>`

Note: Latest version of the AI package on repos is currently 1.5.0.  If you want to pull in a new or different version, check: https://repo1.maven.org/maven2/com/badlogicgames/gdx/gdx-ai/

***



### External Dependencies
#### Adding external repositories
Gradle finds files defined as dependencies by looking through all the repositories defined in the buildscript.  Gradle understands several repository formats, which include Maven and Ivy. 
 
Under the `allprojects` stub, you can see how repositories are defined. Here is an example:
```groovy
allprojects {    
    repositories {
        // Remote Maven repo
        maven { url "https://oss.sonatype.org/content/repositories/snapshots/" } 
        // Maven Central Repo
        mavenCentral()
        // Local Maven repo
        mavenLocal()
        // Remote Ivy dir
        ivy { url "http://some.ivy.com/repo" }
        // Local Ivy dir
        ivy { url "../local-repo" }
    }
}
```
#### Adding Dependencies
External dependencies are identified by their group, name, version and sometimes classifier attributes.

```groovy
dependencies {
    compile group: 'com.badlogicgames.gdx', name: 'gdx', version: '1.0-SNAPSHOT', classifier: 'natives-desktop'
}
```
Gradle allows you to use shortcuts when defining external dependencies, the above configuration is the same as:

```groovy
dependencies {
    compile 'com.badlogicgames.gdx:gdx:1.0-SNAPSHOT:natives-desktop'
}
```

### Mavenizing Local Dependencies
If you would prefer to use maven repositories to manage local .jar files, these two commands will take any local .jar file and install them (and their source) to your local maven repository.

```bash
mvn install:install-file -Dfile=<path-to-file> -DgroupId=<group-id> -DartifactId=<artifact-id> -Dversion=<version> -Dpackaging=<packaging>
```
```bash
mvn install:install-file -Dfile=<path-to-source-file> -DgroupId=<group-id> -DartifactId=<artifact-id> -Dversion=<version> -Dpackaging=<packaging> -Dclassifier=sources
```

To then set up gradle to include your new dependency, edit your build.gradle file in the root project directory and edit the core project entry:
```groovy
project(":core") {
   ...

    dependencies {
        ...
        compile "<group-id>:<artifact-id>:<version>"
        compile "<group-id>:<artifact-id>:<version>:sources"
    }
}
```

After this you will need to refresh your dependencies for your IDE to see, so run:  
Command line - `$ ./gradlew --refresh-dependencies`  
Eclipse - `$ ./gradlew eclipse`  
IntelliJ - `$ ./gradlew idea`  

Also, don't forget that any dependencies added this way also need to be included in the [GWT inheritance file] (#gwt-inheritance).

### File Dependencies
If you have a dependency that is not mavenized, you can still depend on them!

To do this, in your project stub in the root `build.gradle` file, locate the dependencies { } section as always, and add the following:

```groovy
dependencies {
    compile fileTree(dir: 'libs', include: '*.jar')
}
```

This will include all the .jar files in the libs directory as dependencies.


**NOTE**: "dir" is relative to the project root, if you add the dependencies to your android project, 'libs' would need to be in the android/ directory. If you added the dependencies in the core project, 'libs' would need to be in the core/ directory.

An example with a more _complete_ script:
```groovy
project(":android") {
    apply plugin: "android"

    configurations { natives }

    dependencies {
        compile project(":core")
        compile "com.badlogicgames.gdx:gdx-backend-android:$gdxVersion"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-x86"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-armeabi"
        natives "com.badlogicgames.gdx:gdx-platform:$gdxVersion:natives-armeabi-v7a"
   
        compile "com.badlogicgames.gdx:gdx-freetype:$gdxVersion"
        natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-armeabi"
        natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-armeabi-v7a"
        natives "com.badlogicgames.gdx:gdx-freetype-platform:$gdxVersion:natives-x86"
        compile fileTree(dir: 'libs', include: '*.jar')
    }
}
```

It is worth nothing that these file dependencies are not included in the published dependency descriptor for your project, but they are included in transitive project dependencies within the same build.

##### Android Pitfall
When adding `flat file` dependencies to a project, for example the core project, you would need to duplicate the dependency declaration for the android project.  This is because the Android Gradle plugin can't handle transitive `flat file` dependencies.

For example, if you were to add the all the jars in your `libs` directory as dependencies for your project, you would need to do the following.

```groovy
project(":core") {
   ...
   compile fileTree(dir: '../libs', include: '*.jar')
   ...
}

// And also

project(":android") {
   ...
   compile fileTree(dir: '../libs', include: '*.jar')
   ...
}
```

This is only required for the android project, all other projects inherit `flat file` dependencies OK. 


### External Dependencies Examples
#### Universal-Tween-Engine by jar
1. Download the jars
2. Place jars in the directory core/libs (You can change this if you wish)
3. Alter your **build.gradle** script in the root directory as follows:
 * Locate the :core stub where the core project's dependencies are declared
  * Add the line in dependencies
 ```grooovy
compile fileTree(dir: 'libs', include: '*.jar')
```
   * Your script should now look a little like this:
```groovy
project(":core") {
   ...

    dependencies {
        ...
        compile fileTree(dir: 'libs', include: '*.jar')
    }
}
```

**Finally** Refresh your Gradle project, either on command line or using your IDE plugin.

#### Universal-Tween-Engine by locally mavenizing maven
First, download and extract the tween-engine-api from its repository \(https://code.google.com/p/java-universal-tween-engine/). To install this dependency and its source files into your local maven repo, use these commands:
```bash
mvn install:install-file -Dfile=tween-engine-api.jar -DgroupId=aurelienribon -DartifactId=tweenengine -Dversion=6.3.3 -Dpackaging=jar

mvn install:install-file -Dfile=tween-engine-api-sources.jar -DgroupId=aurelienribon -DartifactId=tweenengine -Dversion=6.3.3 -Dpackaging=jar -Dclassifier=sources
```

With the tween engine jars in your local maven repo, add a dependency to them in your build.gradle in the root project file.

```groovy
project(":core") {
   ...

    dependencies {
        ...
        compile "aurelienribon:tweenengine:6.3.3"
        compile "aurelienribon:tweenengine:6.3.3:sources"
    }
}
```

Add the inheritance to GdxDefinition.gwt.xml and GdxDefinitionSuperdev.gwt.xml
```xml
<inherits name='aurelienribon.tweenengine'/>
```

Then just refresh your dependencies.
```bash
$ ./gradlew --refresh-dependencies
```

### Gwt Inheritance
Gwt is special, so in order to let the GWT compiler know what modules the project depends on, and _inherits_ from, you need to let it know.

This is done in the `gwt.xml` files in the gwt sub directory. You will need to make the changes both to the `GdxDefinition.gwt.xml` and also the `GdxDefinitionSuperdev.gwt.xml`.

**The _default_ gwt.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE module PUBLIC "-//Google Inc.//DTD Google Web Toolkit trunk//EN" "http://google-web-toolkit.googlecode.com/svn/trunk/distro-source/core/src/gwt-module.dtd">
<module rename-to="html">
	<inherits name='com.badlogic.gdx.backends.gdx_backends_gwt' />
	<inherits name='com.badlogic.mygame.MyGame' />
	<entry-point class='com.badlogic.mygame.client.GwtLauncher' />
	
	<set-configuration-property name="gdx.assetpath" value="../android/assets" />
</module>
```
We depend on the libgdx gwt backend, as well as the core project, so we have them defined in a <inherits> tag.  So when you add your dependency via methods above, you need to add it here too!

#### Libgdx Extension Inherits
These are the libgdx extensions that are supported in gwt

* Libgdx Core - `<inherits name='com.badlogic.gdx.backends.gdx_backends_gwt' />`
* Box2d       - `<inherits name='com.badlogic.gdx.physics.box2d.box2d-gwt' />`
* Box2dLights       - `<inherits name='Box2DLights' />`
* Controllers - `<inherits name='com.badlogic.gdx.controllers.controllers-gwt' />`

**An example: The Universal Tween Engine**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE module PUBLIC "-//Google Inc.//DTD Google Web Toolkit trunk//EN" "http://google-web-toolkit.googlecode.com/svn/trunk/distro-source/core/src/gwt-module.dtd">
<module rename-to="html">
	<inherits name='com.badlogic.gdx.backends.gdx_backends_gwt' />
	<inherits name='com.badlogic.mygame.MyGame' />
	//Let's inherit tween
	<inherits name='aurelienribon.tweenengine'/>
	<entry-point class='com.badlogic.mygame.client.GwtLauncher' />
	
	<set-configuration-property name="gdx.assetpath" value="../android/assets" />
</module>
```

#### Step by step Universal Tween Engine guide
This guide uses everything that is explained in this article to add the Universal Tween Engine to your project as a dependency.

[Click me](Universal-Tween-Engine)