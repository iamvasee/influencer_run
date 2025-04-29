// Simple test to ensure HUD is working
window.addEventListener('load', function() {
    // Load profile image
    const profileImage = new Image();
    profileImage.src = 'Assets/posters/profile.png';
    
    // Once image is loaded, we can start drawing
    profileImage.onload = function() {
        // Draw profile with verified badge
        window.drawProfile = function() {
            const ctx = window.ctx;
            if (!ctx) return;
            
            const padding = 24;
            const imageSize = 32;
            
            try {
                // Draw profile picture with circular clipping
                ctx.save();
                ctx.beginPath();
                ctx.arc(padding + imageSize/2, padding + imageSize/2, imageSize/2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(profileImage, padding, padding, imageSize, imageSize);
                ctx.restore();
                
                // Draw username
                ctx.save();
                ctx.fillStyle = '#fff';
                ctx.font = '500 16px Space Grotesk, Arial, sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                const username = 'average_influencer';
                const usernameX = padding + imageSize + 8;
                const usernameY = padding + imageSize/2;
                ctx.fillText(username, usernameX, usernameY);
                
                // Draw verified badge
                const textWidth = ctx.measureText(username).width;
                const badgeX = usernameX + textWidth + 4;
                const badgeY = usernameY;
                const badgeSize = 14;
                
                // Draw blue circle background
                ctx.beginPath();
                ctx.arc(badgeX + badgeSize/2, badgeY, badgeSize/2, 0, Math.PI * 2);
                ctx.fillStyle = '#1DA1F2';
                ctx.fill();
                
                // Draw checkmark
                ctx.beginPath();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.moveTo(badgeX + 4, badgeY);
                ctx.lineTo(badgeX + 6, badgeY + 2);
                ctx.lineTo(badgeX + 10, badgeY - 2);
                ctx.stroke();
                
                ctx.restore();
            } catch (error) {
                console.error('HUD Error:', error);
            }
        };

        // Draw live counter and viewer count
        window.drawLiveCounter = function(totalRewardPoints = 0) {
            const ctx = window.ctx;
            if (!ctx) return;
            
            try {
                const padding = 24;
                const badgeHeight = 32;
                
                // Calculate badge dimensions and positions
                const liveText = 'LIVE';
                ctx.font = '700 16px Space Grotesk, Arial, sans-serif';
                const liveWidth = ctx.measureText(liveText).width + 32;
                
                // Calculate dynamic width for eye badge based on number of digits
                const viewCountText = (typeof window.totalRewardPoints !== 'undefined' ? window.totalRewardPoints : totalRewardPoints).toString();
                ctx.font = '500 16px Space Grotesk, Arial, sans-serif';
                const viewCountWidth = ctx.measureText(viewCountText).width;
                const eyeIconWidth = 20;
                const eyeIconPadding = 16;
                const eyeBadgeWidth = Math.max(70, eyeIconWidth + eyeIconPadding + viewCountWidth + 20);
                
                const gap = 8;
                const eyeX = window.canvas.width - padding - eyeBadgeWidth;
                const eyeY = padding;
                const liveX = eyeX - liveWidth - gap;
                const liveY = padding;
                
                // Draw LIVE badge
                ctx.save();
                const grad = ctx.createLinearGradient(liveX, liveY, liveX + liveWidth, liveY + badgeHeight);
                grad.addColorStop(0, '#ff007a');
                grad.addColorStop(1, '#ff4e50');
                ctx.fillStyle = grad;
                
                // Draw rounded rectangle for LIVE
                ctx.beginPath();
                ctx.roundRect(liveX, liveY, liveWidth, badgeHeight, 16);
                ctx.fill();
                
                // Draw LIVE text
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(liveText, liveX + liveWidth/2, liveY + badgeHeight/2);
                ctx.restore();
                
                // Draw views badge
                ctx.save();
                ctx.fillStyle = '#18181b';
                ctx.beginPath();
                ctx.roundRect(eyeX, eyeY, eyeBadgeWidth, badgeHeight, 16);
                ctx.fill();
                
                // Draw eye icon
                ctx.save();
                ctx.translate(eyeX + 20, eyeY + badgeHeight/2);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, 8, 6, 0, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.restore();
                
                // Draw view count
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(viewCountText, eyeX + 38, eyeY + badgeHeight/2);
                ctx.restore();
            } catch (error) {
                console.error('HUD Error:', error);
            }
        };
    };
    
    profileImage.onerror = function() {
        console.error('Failed to load profile image');
    };
}); 