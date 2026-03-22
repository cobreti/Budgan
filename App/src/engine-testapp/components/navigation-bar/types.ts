export type NavigationBarItem = {
    name: string
    icon: string
    link: string
}

export type NavigationBarItems = NavigationBarItem[]

export type NavigationBarProps = {
    items?: NavigationBarItems
}
