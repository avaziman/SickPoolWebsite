import './Footer.css'
import GIcon from './GIcon';

export default function Footer() {
    return (
        <footer>
            <div id="community">
                <h3>Community</h3>
                <ul id="community-links">
                    
                    <li>
                        <a href="https://discord.gg/SDpSXy2Sbq" target="_blank" rel="noreferrer">
                            <img src="/icons/discord-mark-white.svg" className='link-icon' alt="discord-icon" />
                            <span>Discord</span>
                        </a>
                        <a href="https://discord.gg/SDpSXy2Sbq" target="_blank" rel="noreferrer">
                            <GIcon name='code' classNameAddition='link-icon'/>
                            <span>API</span>
                        </a>
                    </li>
                    {/* <li>Reddit</li> */}
                </ul>
            </div>
        </footer>
    );
}