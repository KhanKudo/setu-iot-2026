import asyncio
from time import sleep

from sense_hat import SenseHat

from websocket import KisDBClient, KisDBViewer

sense = SenseHat()
# sense.set_rotation(90)

print(sense.get_temperature_from_pressure())
print(sense.get_temperature_from_humidity())
print(sense.get_humidity())

o = sense.get_orientation()
pitch = o["pitch"]
roll = o["roll"]
yaw = o["yaw"]
print("pitch {0} roll {1} yaw {2}".format(pitch, roll, yaw))

g = (0, 255, 0)  # Green
b = (0, 0, 0)  # Black

creeper_pixels = [
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    g,
    b,
    b,
    g,
    g,
    b,
    b,
    g,
    g,
    b,
    b,
    g,
    g,
    b,
    b,
    g,
    g,
    g,
    g,
    b,
    b,
    g,
    g,
    g,
    g,
    g,
    b,
    b,
    b,
    b,
    g,
    g,
    g,
    g,
    b,
    b,
    b,
    b,
    g,
    g,
    g,
    g,
    b,
    g,
    g,
    b,
    g,
    g,
]

sense.set_pixels(creeper_pixels)

# sense.show_letter("Z")

sleep(1)
sense.clear()

# while True:
#    for event in sense.stick.get_events():
#        print(event.direction, event.action)
#    sleep(5)


def render(matrix, _=None):
    BLACK = (int(0), int(0), int(0))

    pixels = [BLACK] * 64

    value = int(0)

    for i, char in enumerate(matrix):
        value = ord(char) - 48  # starts from ascii '0'
        pixels[i] = (
            85 * (value >> 4),
            85 * ((value & 0b00001100) >> 2),
            85 * (value & 0b11),
        )

    sense.set_pixels(pixels)


render("0000000000000000000000000000000000000000000000000000000000000000")


async def main():
    print("started")
    client = KisDBClient(
        "ws://192.168.0.20:3000/kisdb-ws",
        "94de889064a147c3a960d289356858dc6a384b2a90c04f078a47bd87ddef7137",
    )
    await asyncio.sleep(1)
    DB = KisDBViewer(client)

    # GET
    print(f"DB.x -> {await DB.x}")

    # SET
    await DB.x(99)

    # SUB
    def my_listener(val, key):
        print(f"Changed: {key} -> {val}")

    await DB.x.onnow(my_listener)

    await DB.matrix.onnow(render)

    while 1:
        await asyncio.sleep(0.01)
        for event in sense.stick.get_events():
            if event.action == "held":
                continue
            await getattr(DB.stick, event.direction)(
                True if event.action == "pressed" else False
            )


if __name__ == "__main__":
    asyncio.run(main())


# sense.show_message("Hello, World!", scroll_speed = .1, text_colour = (150,110,0))

# sense.clear((50,50,50))
