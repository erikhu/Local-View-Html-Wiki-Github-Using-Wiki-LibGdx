Because of issues with perspective and depth, the 2D particle effects are not suitable for 3D applications.  Additionally, the 3d particle effects take full advantage of movement through 3d space, allowing a wide variety of dynamic graphical effects.

[[images/flamedemo.gif]]

### Flame - 3D Particle Editor
Much like their 2D cousins, 3D particle effects can be edited with a GUI editor included in libgdx.
The editor is called Flame, and is located in the non-core gdx-tools.jar.  If you have a clone of the libgdx repo, you can run the editor by using the following command from the **dist** directory:

Linux/Mac:
```
java -cp gdx.jar:gdx-natives.jar:gdx-backend-lwjgl.jar:gdx-backend-lwjgl-natives.jar:extensions/gdx-tools/gdx-tools.jar com.badlogic.gdx.tools.flame.FlameMain
```

Windows:
```
java -cp gdx.jar;gdx-natives.jar;gdx-backend-lwjgl.jar;gdx-backend-lwjgl-natives.jar;extensions/gdx-tools/gdx-tools.jar com.badlogic.gdx.tools.flame.FlameMain
```

### Particle Effect Types
There are 3 different kinds of 3D particle effects:
* Billboards
* PointSprites
* ModelInstance
* ??TODO: ParticleController??

**Billboards** are sprites that always face the camera (the Decal class in libgdx is essentially a billboard)

**PointSprites** are simpler (more efficient, better performance) than billboards.  They are colored points with no textures.  The dust and explosion effects in the following video are done with PointSprites:

[3D Tank Battle video](https://www.youtube.com/watch?v=lt9kYDb9p78)

**ModelInstances** are familiar to you if you have done any 3D work in libgdx.  They are instances of 3D models.  Not surprisingly, this is the most taxing type of particle effect in terms of performance.

-----------------

# Using 3D Particle Effects
The easiest way to use 3D particle effects is by taking advantage of the ParticleSystem class, abstracting away various details and managing them for you. First we will create the batch of the type(s) we wish to use, then create the ParticleSystem.  In this case, we are going to use PointSprites

For a more in depth look at how to use 3d particles programattically, [take a look at the test class](https://github.com/libgdx/libgdx/blob/master/tests/gdx-tests/src/com/badlogic/gdx/tests/g3d/ParticleControllerTest.java):

**IMPORTANT**: When you import the **ParticleEffect** class into your IDE, make sure you do not accidentally import the 2D effect ParticleEffect class.  They share the same name, but have different import paths. You are looking for: **com.badlogic.gdx.graphics.g3d.particles.ParticleEffect**

### Step 1: Create Batches and ParticleSystem
```java
// ParticleSystem is a singleton class, we get the instance instead of creating a new object:
ParticleSystem particleSystem = ParticleSystem.get();
PointSpriteParticleBatch pointSpriteBatch = new PointSpriteParticleBatch();
pointSpriteBatch.setCamera(cam);
particleSystem.add(pointSpriteBatch);
```

### Step 2: Load Effects Using AssetManager
Now we need to load our particle effects that we have created using the Flame GUI editor.
First, create a ParticleEffectLoadParameter to pass to the asset manager when loading.
Then the assets may be loaded.
```java
AssetManager assets = new AssetManager();
ParticleEffectLoader.ParticleEffectLoadParameter loadParam = new ParticleEffectLoader.ParticleEffectLoadParameter(particleSystem.getBatches());
		ParticleEffectLoader loader = new ParticleEffectLoader(new InternalFileHandleResolver());
assets.setLoader(ParticleEffect.class, loader);
assets.load("particle/effect.pfx", ParticleEffect.class, loadParam);
assets.finishLoading()
```

### Step 3: Add Loaded ParticleEffects to the ParticleSystem
```java
ParticleEffect originalEffect = assets.get("particle/effect.pfx");
// we cannot use the originalEffect, we must make a copy each time we create new particle effect
ParticleEffect effect = originalEffect.copy();
effect.init();
effect.start();  // optional: particle will begin playing immediately
particleSystem.add(effect);
```

If you scroll back up and watch the 3D Tank Battle video, you will see that each tank has its own dust effects.  That means each tank has it's own copy of the effect inside the system.  You really don't want to make a new copy of the particle effect each time you create an object or graphical effect that needs it.  Instead, you should use Pool the effects to avoid new object creation. You can read more about Pooling in this wiki or the libgdx Pool class documentation.

Here is an example of a Pool:
```java
private static class PFXPool extends Pool<ParticleEffect> {
	private ParticleEffect sourceEffect;

	public PFXPool(ParticleEffect sourceEffect) {
		this.sourceEffect = sourceEffect;
	}

	@Override
	public void free(ParticleEffect pfx) {
		pfx.reset();
		super.free(pfx);
	}

	@Override
	protected ParticleEffect newObject() {
		return sourceEffect.copy();
	}
}
```
Note that we reset the particle when it is freed, not during obtain. This avoids a NullPointerException that occurs because of how the ParticleSystem works.

### Step 4: Rendering our 3D Particles Using the ParticleSystem
A ParticleSystem must update and draw its own components, then be passed to a ModelBatch instance to be rendered to the scene.
```java
private void renderParticleEffects() {
	particleSystem.update(); // technically not necessary for rendering
	particleSystem.begin();
	particleSystem.draw();
	particleSystem.end();
	modelBatch.render(particleSystem);
}
```

You can also translate and rotate the effect.  Depending on how your engine works you might want to use a specific matrix that is reset to identity on changes or only add the delta transformation/rotation.

```java
private void renderParticleEffects() {
	targetMatrix.idt();
	targetMatrix.translate(targetPos);
	effect.setTransform(targetMatrix);
	particleSystem.update(); // technically not necessary for rendering
	particleSystem.begin();
	particleSystem.draw();
	particleSystem.end();
	modelBatch.render(particleSystem);
}
```

or

```java
private void renderParticleEffects() {
	effect.translate(deltaPos);
	particleSystem.update(); // technically not necessary for rendering
	particleSystem.begin();
	particleSystem.draw();
	particleSystem.end();
	modelBatch.render(particleSystem);
}
```

### Stop New Particle Emission, But Let Existing Particles Finish Playing
It is a little bit more complicated to do this in the 3D Particle System:

```java
Emitter emitter = pfx.getControllers().first().emitter;
		if (emitter instanceof RegularEmitter) {
			RegularEmitter reg = (RegularEmitter) emitter;
			reg.setEmissionMode(RegularEmitter.EmissionMode.EnabledUntilCycleEnd);
		}
```

### Full Usage Example (external source)
You can find a full working example at (https://drive.google.com/file/d/0BwiuGlZ9rT-bRm9zQlJHbzFCWWs/edit?usp=sharing)

The main class is core/sbourges/game/gdxtest/GdxTest.java