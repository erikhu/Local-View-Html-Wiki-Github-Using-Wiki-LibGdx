In this tutorial we will be extending the simple game "Drop", made in [[a previous tutorial |A Simple Game]]. We will be adding a menu screen, and a couple of features to make this game a little more fully featured.

Let's get started with an introduction to a few more advanced classes in our game.

## The Screen interface ##

Screens are fundamental to any game with multiple components. Screens contain many of the methods you are used to from ApplicationListener objects, and include a couple of new methods: `show` and `hide`, which are called when the Screen gains or loses focus, respectively.

## The Game Class ##

The Game abstract class provides an implementation of ApplicationListener for you to use, along with some helper methods to set and handle Screen rendering.

Together, Screen and Game objects are used to create a simple and powerful structure for games.

We will start with creating a Game object, which will be the entry point to our game.

Let's show some code and walk through it:

```java
package com.badlogic.drop;

import com.badlogic.gdx.Game;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;


public class Drop extends Game {
	
	public SpriteBatch batch;
	public BitmapFont font;

	public void create() {
		batch = new SpriteBatch();
		//Use LibGDX's default Arial font.
		font = new BitmapFont();
		this.setScreen(new MainMenuScreen(this));
	}

	public void render() {
		super.render(); //important!
	}
	
	public void dispose() {
		batch.dispose();
		font.dispose();
	}

}

```

We start the application with instantiating a SpriteBatch and a BitmapFont. It is a bad practice to create multiple objects that can be shared instead (see [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself)). The SpriteBatch object is used to render objects onto the screen, such as textures; and the BitmapFont object is used, along with a SpriteBatch, to render text onto the screen. We will touch more on this in the Screen classes.

Next, we set the Screen of the Game to a `MainMenuScreen` object, with a Drop instance as its first and only parameter.

A common mistake is to forget to call `super.render()` with a Game implementation. Without this call, the Screen that you set in the `create()` method will not be rendered!

Finally, another reminder to dispose of objects! [[Further reading. | Managing your assets]]

## The Main Menu ##

Now, let's get into the nitty-gritty of the MainMenuScreen class.


```java
package com.badlogic.drop;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;

public class MainMenuScreen implements Screen {

	final Drop game;

	OrthographicCamera camera;

	public MainMenuScreen(final Drop gam) {
		game = gam;

		camera = new OrthographicCamera();
		camera.setToOrtho(false, 800, 480);

	}


        //...Rest of class omitted for succinctness.

}
```

In this code snippet, we make the constructor for the `MainMenuScreen` class, which implements the Screen interface. The Screen interface does not provide any sort of `create()` method, so we instead use a constructor. The only parameter for the constructor necessary for this game is an instance of `Drop`, so that we can call upon its methods and fields if necessary.

Next, the final "meaty" method in the `MainMenuScreen` class: `render(float)`

```java
public class MainMenuScreen implements Screen {

        //public MainMenuScreen(final Drop gam)....        

	@Override
	public void render(float delta) {
		Gdx.gl.glClearColor(0, 0, 0.2f, 1);
		Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

		camera.update();
		game.batch.setProjectionMatrix(camera.combined);

		game.batch.begin();
		game.font.draw(game.batch, "Welcome to Drop!!! ", 100, 150);
		game.font.draw(game.batch, "Tap anywhere to begin!", 100, 100);
		game.batch.end();

		if (Gdx.input.isTouched()) {
			game.setScreen(new GameScreen(game));
			dispose();
		}
	}

        //Rest of class still omitted...

}

```

The code here is fairly straightforward, except for the fact that we need to call game's SpriteBatch and BitmapFont instances instead of creating our own. `game.font.draw(SpriteBatch, String, float,float)`, is how text is rendered to the screen. LibGDX comes with a pre-made font, Arial, so that you can you use the default constructor and still get a font.

We then check to see if the screen has been touched, if it has, then we check to set the games screen to a GameScreen instance, and then dispose of the current instance of MainMenuScreen. The rest of the methods that are needed to implement in the MainMenuScreen are left empty, so I'll continue to omit them (there is nothing to dispose of in this class).

## The Game Screen ##

Now that we have our main menu finished, it's time to finally get to making our game. We will be lifting most of the code from the [[original game | A Simple Game]] as to avoid redundancy, and avoid having to think of a different game idea to implement as simply as Drop is. 


```java
package com.badlogic.drop;

import java.util.Iterator;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input.Keys;
import com.badlogic.gdx.Screen;
import com.badlogic.gdx.audio.Music;
import com.badlogic.gdx.audio.Sound;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.math.Rectangle;
import com.badlogic.gdx.math.Vector3;
import com.badlogic.gdx.utils.Array;
import com.badlogic.gdx.utils.TimeUtils;

public class GameScreen implements Screen {
	final Drop game;

	Texture dropImage;
	Texture bucketImage;
	Sound dropSound;
	Music rainMusic;
	OrthographicCamera camera;
	Rectangle bucket;
	Array<Rectangle> raindrops;
	long lastDropTime;
	int dropsGathered;

	public GameScreen(final Drop gam) {
		this.game = gam;

		// load the images for the droplet and the bucket, 64x64 pixels each
		dropImage = new Texture(Gdx.files.internal("droplet.png"));
		bucketImage = new Texture(Gdx.files.internal("bucket.png"));

		// load the drop sound effect and the rain background "music"
		dropSound = Gdx.audio.newSound(Gdx.files.internal("drop.wav"));
		rainMusic = Gdx.audio.newMusic(Gdx.files.internal("rain.mp3"));
		rainMusic.setLooping(true);

		// create the camera and the SpriteBatch
		camera = new OrthographicCamera();
		camera.setToOrtho(false, 800, 480);

		// create a Rectangle to logically represent the bucket
		bucket = new Rectangle();
		bucket.x = 800 / 2 - 64 / 2; // center the bucket horizontally
		bucket.y = 20; // bottom left corner of the bucket is 20 pixels above
						// the bottom screen edge
		bucket.width = 64;
		bucket.height = 64;

		// create the raindrops array and spawn the first raindrop
		raindrops = new Array<Rectangle>();
		spawnRaindrop();

	}

	private void spawnRaindrop() {
		Rectangle raindrop = new Rectangle();
		raindrop.x = MathUtils.random(0, 800 - 64);
		raindrop.y = 480;
		raindrop.width = 64;
		raindrop.height = 64;
		raindrops.add(raindrop);
		lastDropTime = TimeUtils.nanoTime();
	}

	@Override
	public void render(float delta) {
		// clear the screen with a dark blue color. The
		// arguments to glClearColor are the red, green
		// blue and alpha component in the range [0,1]
		// of the color to be used to clear the screen.
		Gdx.gl.glClearColor(0, 0, 0.2f, 1);
		Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

		// tell the camera to update its matrices.
		camera.update();

		// tell the SpriteBatch to render in the
		// coordinate system specified by the camera.
		game.batch.setProjectionMatrix(camera.combined);

		// begin a new batch and draw the bucket and
		// all drops
		game.batch.begin();
		game.font.draw(game.batch, "Drops Collected: " + dropsGathered, 0, 480);
		game.batch.draw(bucketImage, bucket.x, bucket.y);
		for (Rectangle raindrop : raindrops) {
			game.batch.draw(dropImage, raindrop.x, raindrop.y);
		}
		game.batch.end();

		// process user input
		if (Gdx.input.isTouched()) {
			Vector3 touchPos = new Vector3();
			touchPos.set(Gdx.input.getX(), Gdx.input.getY(), 0);
			camera.unproject(touchPos);
			bucket.x = touchPos.x - 64 / 2;
		}
		if (Gdx.input.isKeyPressed(Keys.LEFT))
			bucket.x -= 200 * Gdx.graphics.getDeltaTime();
		if (Gdx.input.isKeyPressed(Keys.RIGHT))
			bucket.x += 200 * Gdx.graphics.getDeltaTime();

		// make sure the bucket stays within the screen bounds
		if (bucket.x < 0)
			bucket.x = 0;
		if (bucket.x > 800 - 64)
			bucket.x = 800 - 64;

		// check if we need to create a new raindrop
		if (TimeUtils.nanoTime() - lastDropTime > 1000000000)
			spawnRaindrop();

		// move the raindrops, remove any that are beneath the bottom edge of
		// the screen or that hit the bucket. In the later case we increase the 
		// value our drops counter and add a sound effect.
		Iterator<Rectangle> iter = raindrops.iterator();
		while (iter.hasNext()) {
			Rectangle raindrop = iter.next();
			raindrop.y -= 200 * Gdx.graphics.getDeltaTime();
			if (raindrop.y + 64 < 0)
				iter.remove();
			if (raindrop.overlaps(bucket)) {
				dropsGathered++;
				dropSound.play();
				iter.remove();
			}
		}
	}

	@Override
	public void resize(int width, int height) {
	}

	@Override
	public void show() {
		// start the playback of the background music
		// when the screen is shown
		rainMusic.play();
	}

	@Override
	public void hide() {
	}

	@Override
	public void pause() {
	}

	@Override
	public void resume() {
	}

	@Override
	public void dispose() {
		dropImage.dispose();
		bucketImage.dispose();
		dropSound.dispose();
		rainMusic.dispose();
	}

}

```

This code is almost 95% the same as the original implementation, except now we use a constructor instead of the `create()` method of the `ApplicationListener`, and pass in a `Drop` object, like in the `MainMenuScreen` class. We also start playing the music as soon as the Screen is set to `GameScreen`. 

We also added a string to the top left corner of the game, which tracks the number of raindrops collected.

That's it, you have the complete game finished. That is all there is to know about the Screen interface and Game abstract Class, and all there is to creating multifaceted games with multiple states.

For the full code, please visit [this Github gist](https://gist.github.com/sinistersnare/6367829) 

## The Future ##

Now that you have a grasp of multiple screens, it's time to take advantage of the opportunity. Learn about [[Scene2d | scene2d]], [[Scene2D.ui | Scene2d.ui]] and [[Skins | Skin]] to make your main menu beautiful, and maybe add explosions to the drop game, for realism of course.

If you've also read the next steps from the previous Drop tutorial, you should be ready to make your own game. The best practice is to get out there and do it, so go and make the next big thing!